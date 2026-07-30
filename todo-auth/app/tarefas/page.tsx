"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Task = {
    id: string;
    userId: string;
    title: string;
    description: string;
    completed: boolean;
    dueDate?: string;
    dueTime?: string;
    priority?: "Baixa" | "Média" | "Alta";
};

type User = {
    id: string;
    email: string;
    role: "user" | "admin";
    blocked: boolean;
};

const API_URL = "http://localhost:3001";

export default function Tarefas() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [priority, setPriority] = useState<
        "Baixa" | "Média" | "Alta"
    >("Média");

    const [editingId, setEditingId] = useState<string | null>(null);

    const [filter, setFilter] = useState<
        "all" | "pending" | "completed"
    >("all");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [theme, setTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");

        if (savedTheme === "dark") {
            setTheme("dark");
        }

        verificarUsuario();
    }, []);

    useEffect(() => {
        if (user) {
            carregarTarefas();
        }
    }, [user]);

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [theme]);

    function verificarUsuario() {
        const savedUser = localStorage.getItem("user");

        if (!savedUser) {
            router.push("/login");
            return;
        }

        const loggedUser: User = JSON.parse(savedUser);

        setUser(loggedUser);
    }

    async function carregarTarefas() {
        if (!user) return;

        try {
            const response = await fetch(
                `${API_URL}/tasks?userId=${user.id}`
            );

            if (!response.ok) {
                throw new Error("Erro");
            }

            const data = await response.json();

            setTasks(data);
        } catch (error) {
            console.error(error);
            setError("Não foi possível carregar as tarefas.");
        } finally {
            setLoading(false);
        }
    }

    async function salvarTarefa(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!user) return;

        setError("");

        if (!title.trim()) {
            setError("Digite um título para a tarefa.");
            return;
        }
        const bloqueado = await verificarUsuarioBloqueado();

        if (bloqueado) {
            return;
        }
        async function verificarUsuarioBloqueado() {
            const savedUser = localStorage.getItem("user");

            if (!savedUser) {
                router.push("/login");
                return true;
            }

            const loggedUser: User = JSON.parse(savedUser);

            const response = await fetch(
                `${API_URL}/users/${loggedUser.id}`
            );

            if (!response.ok) {
                alert("Não foi possível verificar seu usuário.");
                return true;
            }

            const currentUser: User = await response.json();

            if (currentUser.blocked === true) {
                alert(
                    "Ação não permitida. Seu usuário está bloqueado."
                );

                return true;
            }

            return false;
        }
        try {
            if (editingId) {
                const response = await fetch(
                    `${API_URL}/tasks/${editingId}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            title,
                            description,
                            dueDate,
                            dueTime,
                            priority,
                        }),
                    }
                );

                if (!response.ok) {
                    throw new Error("Erro");
                }

                const updatedTask = await response.json();

                setTasks((current) =>
                    current.map((task) =>
                        task.id === editingId
                            ? updatedTask
                            : task
                    )
                );
            } else {
                const response = await fetch(
                    `${API_URL}/tasks`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            title,
                            description,
                            dueDate,
                            dueTime,
                            priority,
                            completed: false,
                            userId: user.id,
                        }),
                    }
                );

                if (!response.ok) {
                    throw new Error("Erro");
                }

                const newTask = await response.json();

                setTasks((current) => [
                    ...current,
                    newTask,
                ]);
            }

            limparFormulario();
        } catch (error) {
            console.error(error);
            setError("Não foi possível salvar a tarefa.");
        }
    }

    function editarTarefa(task: Task) {
        setEditingId(task.id);
        setTitle(task.title);
        setDescription(task.description);
        setDueDate(task.dueDate || "");
        setDueTime(task.dueTime || "");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    async function excluirTarefa(id: string) {
        const confirmar = window.confirm(
            "Deseja realmente excluir esta tarefa?"
        );

        if (!confirmar) return;

        try {
            const response = await fetch(
                `${API_URL}/tasks/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error("Erro");
            }

            setTasks((current) =>
                current.filter((task) => task.id !== id)
            );
        } catch (error) {
            console.error(error);
            setError("Não foi possível excluir a tarefa.");
        }
    }

    async function alterarStatus(task: Task) {
        try {
            const response = await fetch(
                `${API_URL}/tasks/${task.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        completed: !task.completed,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Erro");
            }

            const updatedTask = await response.json();

            setTasks((current) =>
                current.map((item) =>
                    item.id === task.id
                        ? updatedTask
                        : item
                )
            );
        } catch (error) {
            console.error(error);
            setError("Não foi possível alterar o status.");
        }
    }

    function limparFormulario() {
        setTitle("");
        setDescription("");
        setDueDate("");
        setDueTime("");
        setEditingId(null);
    }

    async function ativarNotificacoes() {
        if (!("Notification" in window)) {
            alert("Seu navegador não suporta notificações.");
            return;
        }

        const permission =
            await Notification.requestPermission();

        if (permission === "granted") {
            new Notification("Notificações ativadas!", {
                body: "Você receberá avisos sobre suas tarefas.",
            });
        }
    }

    function logout() {
        localStorage.removeItem("user");
        router.push("/login");
    }

    const tarefasFiltradas = tasks.filter((task) => {
        if (filter === "pending") {
            return !task.completed;
        }

        if (filter === "completed") {
            return task.completed;
        }

        return true;
    });

    if (loading) {
        return (
            <main
                className={`flex min-h-screen items-center justify-center transition-colors duration-500 ${
                    theme === "dark"
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
            >
                <p className="animate-pulse text-lg">
                    Carregando...
                </p>
            </main>
        );
    }

    return (
        <main
            className={`min-h-screen p-4 transition-colors duration-500 sm:p-6 ${
                theme === "dark"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
        >
            <div className="mx-auto max-w-6xl">

                {/* CABEÇALHO */}
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h1 className="text-2xl font-bold sm:text-3xl">
                            Minhas Tarefas
                        </h1>

                        <p
                            className={`mt-1 ${
                                theme === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-600"
                                }`}
                        >
                            {user ?.email}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">

                        {user ?.role === "admin" && (
                            <button
                                onClick={() =>
                                    router.push("/admin")
                                }
                                className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-105 hover:bg-purple-700 active:scale-95 sm:px-4"
                            >
                                Administração
                            </button>
                        )}

                        <button
                            onClick={() =>
                                router.push("/calendario")
                            }
                            className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-105 hover:bg-green-700 active:scale-95 sm:px-4"
                        >
                            📅 Calendário
                        </button>

                        <button
                            onClick={ativarNotificacoes}
                            className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-105 hover:bg-yellow-600 active:scale-95 sm:px-4"
                        >
                            🔔 Notificações
                        </button>

                        {/* SWITCH CLARO / ESCURO */}
                        <button
                            type="button"
                            onClick={() =>
                                setTheme(
                                    theme === "light"
                                        ? "dark"
                                        : "light"
                                )
                            }
                            className={`relative flex h-9 w-20 shrink-0 items-center rounded-full p-1 transition-colors duration-500 ${
                                theme === "dark"
                                    ? "bg-gray-700"
                                    : "bg-blue-200"
                                }`}
                            aria-label="Alterar tema"
                        >
                            <span className="absolute left-2 text-sm">
                                ☀️
                            </span>

                            <span className="absolute right-2 text-sm">
                                🌙
                            </span>

                            <span
                                className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-500 ease-in-out ${
                                    theme === "dark"
                                        ? "translate-x-11"
                                        : "translate-x-0"
                                    }`}
                            >
                                {theme === "dark"
                                    ? "🌙"
                                    : "☀️"}
                            </span>
                        </button>

                        <button
                            onClick={logout}
                            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-105 hover:bg-red-700 active:scale-95 sm:px-4"
                        >
                            Sair
                        </button>

                    </div>
                </div>

                {/* ERRO */}
                {error && (
                    <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {/* FORMULÁRIO */}
                <div
                    className={`mb-8 rounded-xl p-5 shadow-lg transition-all duration-500 sm:p-6 ${
                        theme === "dark"
                            ? "bg-gray-800"
                            : "bg-white"
                        }`}
                >
                    <h2 className="mb-4 text-xl font-bold">
                        {editingId
                            ? "Editar tarefa"
                            : "Nova tarefa"}
                    </h2>

                    <form
                        onSubmit={salvarTarefa}
                        className="space-y-4"
                    >
                        <input
                            type="text"
                            placeholder="Título"
                            value={title}
                            onChange={(event) =>
                                setTitle(event.target.value)
                            }
                            className={`w-full rounded-lg border p-3 outline-none transition-all duration-200 focus:scale-[1.01] focus:border-blue-500 ${
                                theme === "dark"
                                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                                    : "border-gray-300 bg-white"
                                }`}
                        />

                        <textarea
                            placeholder="Descrição"
                            value={description}
                            onChange={(event) =>
                                setDescription(
                                    event.target.value
                                )
                            }
                            rows={4}
                            className={`w-full rounded-lg border p-3 outline-none transition-all duration-200 focus:scale-[1.01] focus:border-blue-500 ${
                                theme === "dark"
                                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                                    : "border-gray-300 bg-white"
                                }`}
                        />

                        <div>
                            <label className="mb-1 block font-medium">
                                Prioridade
    </label>

                            <select
                                value={priority}
                                onChange={(event) =>
                                    setPriority(
                                        event.target.value as
                                        "Baixa" |
                                        "Média" |
                                        "Alta"
                                    )
                                }
                                className={`w-full rounded-lg border p-3 ${
                                    theme === "dark"
                                        ? "border-gray-600 bg-gray-700 text-white"
                                        : "border-gray-300 bg-white"
                                    }`}
                            >
                                <option value="Baixa">
                                    🟢 Baixa
        </option>

                                <option value="Média">
                                    🟡 Média
        </option>

                                <option value="Alta">
                                    🔴 Alta
        </option>
                            </select>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">

                            <div>
                                <label className="mb-1 block font-medium">
                                    Data
                                </label>

                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(event) =>
                                        setDueDate(
                                            event.target.value
                                        )
                                    }
                                    className={`w-full rounded-lg border p-3 transition-all duration-200 focus:border-blue-500 ${
                                        theme === "dark"
                                            ? "border-gray-600 bg-gray-700 text-white"
                                            : "border-gray-300 bg-white"
                                        }`}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block font-medium">
                                    Horário
                                </label>

                                <input
                                    type="time"
                                    value={dueTime}
                                    onChange={(event) =>
                                        setDueTime(
                                            event.target.value
                                        )
                                    }
                                    className={`w-full rounded-lg border p-3 transition-all duration-200 focus:border-blue-500 ${
                                        theme === "dark"
                                            ? "border-gray-600 bg-gray-700 text-white"
                                            : "border-gray-300 bg-white"
                                        }`}
                                />
                            </div>

                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">

                            <button
                                type="submit"
                                className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:bg-blue-700 active:scale-95"
                            >
                                {editingId
                                    ? "Salvar alterações"
                                    : "Criar tarefa"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={limparFormulario}
                                    className="rounded-lg bg-gray-500 px-5 py-3 font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:bg-gray-600 active:scale-95"
                                >
                                    Cancelar
                                </button>
                            )}

                        </div>
                    </form>
                </div>

                {/* FILTROS */}
                <div className="mb-5 flex flex-wrap gap-2">

                    <button
                        onClick={() => setFilter("all")}
                        className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                            filter === "all"
                                ? "bg-blue-600 text-white"
                                : theme === "dark"
                                    ? "bg-gray-800"
                                    : "bg-white"
                            }`}
                    >
                        Todas
                    </button>

                    <button
                        onClick={() => setFilter("pending")}
                        className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                            filter === "pending"
                                ? "bg-blue-600 text-white"
                                : theme === "dark"
                                    ? "bg-gray-800"
                                    : "bg-white"
                            }`}
                    >
                        Pendentes
                    </button>

                    <button
                        onClick={() =>
                            setFilter("completed")
                        }
                        className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                            filter === "completed"
                                ? "bg-blue-600 text-white"
                                : theme === "dark"
                                    ? "bg-gray-800"
                                    : "bg-white"
                            }`}
                    >
                        Concluídas
                    </button>

                </div>

                {/* CARDS */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                    {tarefasFiltradas.map((task) => (
                        <div
                            key={task.id}
                            className={`group rounded-xl p-5 shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                                theme === "dark"
                                    ? "bg-gray-800"
                                    : "bg-white"
                                }`}
                        >
                            <div className="mb-3 flex items-start justify-between gap-3">

                                <h3
                                    className={`text-xl font-bold transition-all ${
                                        task.completed
                                            ? "line-through opacity-60"
                                            : ""
                                        }`}
                                >
                                    {task.title}
                                </h3>

                                <span
                                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                                        task.completed
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                        }`}
                                >
                                    {task.completed
                                        ? "Concluída"
                                        : "Pendente"}
                                </span>

                            </div>

                            <p
                                className={`mb-4 ${
                                    theme === "dark"
                                        ? "text-gray-300"
                                        : "text-gray-600"
                                    }`}
                            >
                                {task.description}
                            </p>

                            {task.dueDate && (
                                <p className="mb-1 text-sm">
                                    📅 {task.dueDate}
                                </p>
                            )}

                            {task.dueTime && (
                                <p className="mb-4 text-sm">
                                    ⏰ {task.dueTime}
                                </p>
                            )}

                            {task.priority && (
                                <p className="mb-4 text-sm font-medium">
                                    Prioridade: {
                                        task.priority === "Alta"
                                            ? "🔴 Alta"
                                            : task.priority === "Média"
                                                ? "🟡 Média"
                                                : "🟢 Baixa"
                                    }
                                </p>
                            )}

                            <div className="flex flex-wrap gap-2">

                                <button
                                    onClick={() =>
                                        alterarStatus(task)
                                    }
                                    className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-105 hover:bg-green-700 active:scale-95"
                                >
                                    {task.completed
                                        ? "Reabrir"
                                        : "Concluir"}
                                </button>

                                <button
                                    onClick={() =>
                                        editarTarefa(task)
                                    }
                                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700 active:scale-95"
                                >
                                    Editar
                                </button>

                                <button
                                    onClick={() =>
                                        excluirTarefa(task.id)
                                    }
                                    className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-105 hover:bg-red-700 active:scale-95"
                                >
                                    Excluir
                                </button>

                            </div>
                        </div>
                    ))}

                </div>

                {tarefasFiltradas.length === 0 && (
                    <div
                        className={`mt-6 rounded-xl p-8 text-center shadow ${
                            theme === "dark"
                                ? "bg-gray-800"
                                : "bg-white"
                            }`}
                    >
                        <p>Nenhuma tarefa encontrada.</p>
                    </div>
                )}

            </div>
        </main>
    );
}