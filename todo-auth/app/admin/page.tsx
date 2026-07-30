"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
    id: string;
    email: string;
    password: string;
    role: "user" | "admin";
    blocked?: boolean;
};

type Task = {
    id: string;
    userId: string;
    title: string;
    description: string;
    completed: boolean;
};

const API_URL = "http://localhost:3001";
const PROTECTED_EMAIL = "teste@gmail.com";

export default function Admin() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [theme, setTheme] = useState<"light" | "dark">("light");

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showTasks, setShowTasks] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskDueDate, setTaskDueDate] = useState("");
    const [taskDueTime, setTaskDueTime] = useState("");
    const [search, setSearch] = useState("");
    const [searchTask, setSearchTask] = useState("");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");

        if (savedTheme === "dark") {
            setTheme("dark");
        }

        verificarAdministrador();
    }, []);

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [theme]);

    async function verificarAdministrador() {
        const savedUser = localStorage.getItem("user");

        if (!savedUser) {
            router.push("/login");
            return;
        }

        const loggedUser: User = JSON.parse(savedUser);

        setUser(loggedUser);

        if (loggedUser.role !== "admin") {
            router.push("/tarefas");
            return;
        }

        try {
            const usersResponse = await fetch(
                `${API_URL}/users`
            );

            if (!usersResponse.ok) {
                throw new Error("Erro ao carregar usuários");
            }

            const usersData: User[] =
                await usersResponse.json();

            setUsers(usersData);

            const tasksResponse = await fetch(
                `${API_URL}/tasks`
            );

            if (!tasksResponse.ok) {
                throw new Error("Erro ao carregar tarefas");
            }

            const tasksData: Task[] =
                await tasksResponse.json();

            setTasks(tasksData);
        } catch (error) {
            console.error(error);

            setError(
                "Não foi possível carregar os dados."
            );
        } finally {
            setLoading(false);
        }
    }

    // ==========================================
    // ALTERAR PERMISSÃO
    // ==========================================

    async function alterarPermissao(
        id: string,
        novaRole: "user" | "admin"
    ) {
        const savedUser = localStorage.getItem("user");

        if (!savedUser) {
            router.push("/login");
            return;
        }

        const loggedUser: User =
            JSON.parse(savedUser);

        if (loggedUser.role !== "admin") {
            alert("Ação não permitida.");
            return;
        }

        const targetUser = users.find(
            (item) => item.id === id
        );

        if (!targetUser) {
            alert("Usuário não encontrado.");
            return;
        }

        // Protege o administrador principal
        if (
            targetUser.email === PROTECTED_EMAIL &&
            novaRole === "user"
        ) {
            alert(
                "Ação não permitida. Este administrador está protegido."
            );

            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/users/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        role: novaRole,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Erro ao alterar permissão"
                );
            }

            const updatedUser: User =
                await response.json();

            setUsers((current) =>
                current.map((item) =>
                    item.id === id
                        ? updatedUser
                        : item
                )
            );

            // Se o próprio usuário logado tiver sua
            // permissão alterada, atualiza o localStorage
            if (id === user ?.id) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(updatedUser)
                );

                setUser(updatedUser);

                // Se deixou de ser admin,
                // volta para tarefas
                if (novaRole === "user") {
                    router.push("/tarefas");
                }
            }

            alert("Permissão alterada com sucesso.");
        } catch (error) {
            console.error(error);

            alert(
                "Não foi possível alterar a permissão."
            );
        }
    }

    // ==========================================
    // BLOQUEAR / DESBLOQUEAR
    // ==========================================

    async function alterarBloqueio(
        id: string,
        blocked: boolean
    ) {
        const savedUser = localStorage.getItem("user");

        if (!savedUser) {
            router.push("/login");
            return;
        }

        const loggedUser: User = JSON.parse(savedUser);

        const targetUser = users.find(
            (item) => item.id === id
        );

        if (!targetUser) {
            alert("Usuário não encontrado.");
            return;
        }

        // O administrador protegido nunca pode ser bloqueado
        if (
            targetUser.email === "teste@gmail.com" &&
            blocked === true
        ) {
            alert("Ação não permitida.");
            return;
        }

        // Somente o administrador protegido pode desbloquear
        if (
            blocked === false &&
            loggedUser.email !== "teste@gmail.com"
        ) {
            alert(
                "Ação não permitida. Somente o administrador principal pode desbloquear usuários."
            );
            return;
        }

        const confirmacao = window.confirm(
            blocked
                ? `Deseja bloquear ${targetUser.email}?`
                : `Deseja desbloquear ${targetUser.email}?`
        );

        if (!confirmacao) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/users/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        blocked,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Erro");
            }

            const updatedUser = await response.json();

            setUsers((current) =>
                current.map((item) =>
                    item.id === id
                        ? updatedUser
                        : item
                )
            );

            alert(
                blocked
                    ? "Usuário bloqueado com sucesso."
                    : "Usuário desbloqueado com sucesso."
            );

        } catch (error) {
            console.error(error);

            setError(
                "Não foi possível alterar o bloqueio."
            );
        }
    }

    // ==========================================
    // EXCLUIR USUÁRIO
    // ==========================================

    async function excluirUsuario(id: string) {
        const targetUser = users.find(
            (item) => item.id === id
        );

        if (!targetUser) {
            alert("Usuário não encontrado.");
            return;
        }

        // Protege o administrador principal
        if (targetUser.email === PROTECTED_EMAIL) {
            alert(
                "Ação não permitida. Este administrador está protegido."
            );

            return;
        }

        const confirmacao = window.confirm(
            `Deseja realmente excluir o usuário ${targetUser.email}?`
        );

        if (!confirmacao) {
            return;
        }

        try {
            // Buscar tarefas do usuário
            const tasksResponse = await fetch(
                `${API_URL}/tasks?userId=${targetUser.id}`
            );

            if (!tasksResponse.ok) {
                throw new Error(
                    "Não foi possível buscar as tarefas."
                );
            }

            const userTasks: Task[] =
                await tasksResponse.json();

            // Excluir tarefas
            for (const task of userTasks) {
                await fetch(
                    `${API_URL}/tasks/${task.id}`,
                    {
                        method: "DELETE",
                    }
                );
            }

            // Excluir usuário
            const response = await fetch(
                `${API_URL}/users/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Não foi possível excluir o usuário."
                );
            }

            setUsers((current) =>
                current.filter(
                    (item) => item.id !== id
                )
            );

            setTasks((current) =>
                current.filter(
                    (task) =>
                        String(task.userId) !==
                        String(targetUser.id)
                )
            );

            alert("Usuário excluído com sucesso.");
        } catch (error) {
            console.error(error);

            alert(
                "Não foi possível excluir o usuário."
            );
        }
    }
    async function verTarefasUsuario(user: User) {
        try {
            const response = await fetch(
                `${API_URL}/tasks?userId=${user.id}`
            );

            if (!response.ok) {
                throw new Error("Erro");
            }

            const data = await response.json();

            setTasks(data);
            setSelectedUser(user);
            setShowTasks(true);

        } catch (error) {
            console.error(error);

            setError(
                "Não foi possível carregar as tarefas do usuário."
            );
        }
    }
    function iniciarEdicaoTarefa(task: Task) {
        setEditingTask(task);

        setTaskTitle(task.title);
        setTaskDescription(task.description);
        setTaskDueDate(task.dueDate || "");
        setTaskDueTime(task.dueTime || "");
    }

    async function salvarEdicaoTarefa() {
        if (!editingTask) {
            return;
        }

        if (!taskTitle.trim()) {
            alert("Digite um título para a tarefa.");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/tasks/${editingTask.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title: taskTitle,
                        description: taskDescription,
                        dueDate: taskDueDate,
                        dueTime: taskDueTime,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Erro");
            }

            const updatedTask = await response.json();

            setTasks((current) =>
                current.map((task) =>
                    task.id === editingTask.id
                        ? updatedTask
                        : task
                )
            );

            setEditingTask(null);

            setTaskTitle("");
            setTaskDescription("");
            setTaskDueDate("");
            setTaskDueTime("");

            alert("Tarefa atualizada com sucesso.");

        } catch (error) {
            console.error(error);

            setError(
                "Não foi possível editar a tarefa."
            );
        }
    }
    async function excluirTarefaAdmin(id: string) {
        const confirmar = window.confirm(
            "Deseja realmente excluir esta tarefa?"
        );

        if (!confirmar) {
            return;
        }

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
                current.filter(
                    (task) => task.id !== id
                )
            );

            alert("Tarefa excluída com sucesso.");

        } catch (error) {
            console.error(error);

            setError(
                "Não foi possível excluir a tarefa."
            );
        }
    }

    function voltar() {
        router.push("/tarefas");
    }

    const usuariosFiltrados = users.filter((user) =>
        user.email.toLowerCase().includes(search.toLowerCase())
    );
    if (loading) {
        return (
            <main
                className={`flex min-h-screen items-center justify-center ${
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

                {/* DASHBOARD */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {/* USUÁRIOS */}
                    <div
                        className={`rounded-xl p-5 shadow-lg ${
                            theme === "dark"
                                ? "bg-gray-800"
                                : "bg-white"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">
                                👥
        </span>

                            <p className="font-medium text-gray-500 dark:text-gray-400">
                                Usuários
        </p>
                        </div>

                        <p className="mt-2 text-3xl font-bold">
                            {users.length}
                        </p>
                    </div>

                    {/* TAREFAS */}
                    <div
                        className={`rounded-xl p-5 shadow-lg ${
                            theme === "dark"
                                ? "bg-gray-800"
                                : "bg-white"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">
                                📋
        </span>

                            <p className="font-medium text-gray-500 dark:text-gray-400">
                                Tarefas
        </p>
                        </div>

                        <p className="mt-2 text-3xl font-bold">
                            {tasks.length}
                        </p>
                    </div>

                    {/* CONCLUÍDAS */}
                    <div
                        className={`rounded-xl p-5 shadow-lg ${
                            theme === "dark"
                                ? "bg-gray-800"
                                : "bg-white"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">
                                ✅
        </span>

                            <p className="font-medium text-gray-500 dark:text-gray-400">
                                Concluídas
        </p>
                        </div>

                        <p className="mt-2 text-3xl font-bold text-green-500">
                            {
                                tasks.filter(
                                    (task) => task.completed
                                ).length
                            }
                        </p>
                    </div>

                    {/* PENDENTES */}
                    <div
                        className={`rounded-xl p-5 shadow-lg ${
                            theme === "dark"
                                ? "bg-gray-800"
                                : "bg-white"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">
                                ⏳
        </span>

                            <p className="font-medium text-gray-500 dark:text-gray-400">
                                Pendentes
        </p>
                        </div>

                        <p className="mt-2 text-3xl font-bold text-yellow-500">
                            {
                                tasks.filter(
                                    (task) => !task.completed
                                ).length
                            }
                        </p>
                    </div>

                </div>


                {/* CABEÇALHO */}
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h1 className="text-2xl font-bold sm:text-3xl">
                            Administração
                        </h1>

                        <p
                            className={
                                theme === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-600"
                            }
                        >
                            Gerenciar usuários e permissões
                         </p>
                    </div>

                    <div className="flex items-center gap-3">

                        {/* PESQUISA */}

                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="🔍 Pesquisar tarefa..."
                                value={searchTask}
                                onChange={(e) => setSearchTask(e.target.value)}
                                className={`w-full rounded-lg border p-3 ${
                                    theme === "dark"
                                        ? "border-gray-600 bg-gray-700 text-white"
                                        : "border-gray-300 bg-white"
                                    }`}
                            />
                        </div>
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="🔍 Pesquisar usuário pelo e-mail..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`w-full rounded-lg border p-3 transition-all duration-200 focus:border-blue-500 focus:outline-none ${
                                    theme === "dark"
                                        ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                                        : "border-gray-300 bg-white text-gray-900"
                                    }`}
                            />
                        </div>

                        {/* TEMA */}
                        <button
                            type="button"
                            onClick={() =>
                                setTheme(
                                    theme === "light"
                                        ? "dark"
                                        : "light"
                                )
                            }
                            className={`relative flex h-9 w-20 items-center rounded-full p-1 ${
                                theme === "dark"
                                    ? "bg-gray-700"
                                    : "bg-blue-200"
                                }`}
                        >
                            <span className="absolute left-2 text-sm">
                                ☀️
                            </span>

                            <span className="absolute right-2 text-sm">
                                🌙
                            </span>

                            <span
                                className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ${
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
                            onClick={voltar}
                            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                        >
                            Voltar
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}
                <div className="mb-5">
                    <input
                        type="text"
                        placeholder="🔍 Pesquisar usuário pelo e-mail..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`w-full rounded-lg border p-3 transition-all duration-200 focus:border-blue-500 ${
                            theme === "dark"
                                ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                                : "border-gray-300 bg-white"
                            }`}
                    />
                </div>
                {/* TABELA */}
                <div
                    className={`overflow-hidden rounded-xl shadow-lg ${
                        theme === "dark"
                            ? "bg-gray-800"
                            : "bg-white"
                        }`}
                >
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[850px]">

                            <thead
                                className={
                                    theme === "dark"
                                        ? "bg-gray-700"
                                        : "bg-gray-100"
                                }
                            >
                                <tr>
                                    <th className="p-4 text-left">
                                        E-mail
                                    </th>

                                    <th className="p-4 text-left">
                                        Tipo
                                    </th>

                                    <th className="p-4 text-left">
                                        Alterar permissão
                                    </th>

                                    <th className="p-4 text-left">
                                        Status
                                    </th>

                                    <th className="p-4 text-left">
                                        Ações
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {users
                                    .filter((item) =>
                                        item.email
                                            .toLowerCase()
                                            .includes(search.toLowerCase())
                                    )
                                    .map((item) => {
                                        const isProtected =
                                            item.email ===
                                            PROTECTED_EMAIL;

                                        const isBlocked =
                                            item.blocked === true;

                                        return (
                                            <tr
                                                key={item.id}
                                                className={`border-t ${
                                                    theme === "dark"
                                                        ? "border-gray-700"
                                                        : "border-gray-200"
                                                    }`}
                                            >
                                                {/* EMAIL */}
                                                <td className="p-4">
                                                    {item.email}

                                                    {isProtected && (
                                                        <span className="ml-2 text-sm text-yellow-500">
                                                            🔒 Protegido
                                                    </span>
                                                    )}
                                                </td>

                                                {/* ROLE */}
                                                <td className="p-4">
                                                    {item.role ===
                                                        "admin"
                                                        ? "👑 Administrador"
                                                        : "👤 Usuário"}
                                                </td>

                                                {/* ALTERAR PERMISSÃO */}
                                                <td className="p-4">
                                                    {isProtected ? (
                                                        <span className="text-sm text-gray-500">
                                                            🔒 Protegido
                                                    </span>
                                                    ) : (
                                                            <select
                                                                value={
                                                                    item.role
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    alterarPermissao(
                                                                        item.id,
                                                                        event
                                                                            .target
                                                                            .value as
                                                                        | "user"
                                                                        | "admin"
                                                                    )
                                                                }
                                                                className={`rounded-lg border p-2 ${
                                                                    theme ===
                                                                        "dark"
                                                                        ? "border-gray-600 bg-gray-700 text-white"
                                                                        : "border-gray-300 bg-white text-gray-900"
                                                                    }`}
                                                            >
                                                                <option value="user">
                                                                    Usuário
                                                        </option>

                                                                <option value="admin">
                                                                    Administrador
                                                        </option>
                                                            </select>
                                                        )}
                                                </td>

                                                {/* STATUS */}
                                                <td className="p-4">
                                                    {isBlocked ? (
                                                        <span className="font-medium text-red-500">
                                                            🔴 Bloqueado
                                                    </span>
                                                    ) : (
                                                            <span className="font-medium text-green-500">
                                                                🟢 Ativo
                                                    </span>
                                                        )}
                                                </td>

                                                {/* AÇÕES */}
                                                <td className="p-4">
                                                    <div className="flex flex-wrap gap-2">

                                                        {isProtected ? (
                                                            <span className="rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-600">
                                                                🔒 Protegido
                                                        </span>
                                                        ) : (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            alterarBloqueio(
                                                                                item.id,
                                                                                !isBlocked
                                                                            )
                                                                        }
                                                                        className={`rounded-lg px-3 py-2 font-medium text-white ${
                                                                            isBlocked
                                                                                ? "bg-green-600 hover:bg-green-700"
                                                                                : "bg-red-600 hover:bg-red-700"
                                                                            }`}
                                                                    >
                                                                        {isBlocked
                                                                            ? "🔓 Desbloquear"
                                                                            : "🔒 Bloquear"}
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            excluirUsuario(
                                                                                item.id
                                                                            )
                                                                        }
                                                                        className="rounded-lg bg-red-700 px-3 py-2 font-medium text-white hover:bg-red-800"
                                                                    >
                                                                        🗑️ Excluir
                                                            </button>
                                                                </>
                                                            )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}