"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `http://localhost:3001/users?email=${encodeURIComponent(email)}`
            );

            if (!response.ok) {
                throw new Error("Erro ao conectar com o servidor.");
            }

            const users = await response.json();

            console.log("Usuários encontrados:", users);

            if (users.length === 0) {
                setError("E-mail ou senha incorretos.");
                return;
            }

            const user = users[0];

            if (user.password !== password) {
                setError("E-mail ou senha incorretos.");
                return;
            }

            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    blocked: user.blocked ?? false,
                })
            );

            router.push("/tarefas");

        } catch (error) {
            console.error(error);
            setError("Não foi possível realizar o login.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main
            className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage:
                    "url('https://lh3.googleusercontent.com/gg-dl/AAQ_wbHINBhMiLA5UqMOwl4Jlh_p0KzqddSkGbR94klI5WAmbLuSpRmRvSLqWuTsRZ6c52f679cB4PmJnuX5wLbmIZN1xph3BGBwY_g3q4Ye5LxUf97-flO3mcLc6qflxB1XKAaYez27TuMBpOfziEZoetlcif6KK5Wto2pOdlOtPM_D5ObEtA=s1024-rj')",
            }}
        >
            {/* Camada escura */}
            <div className="absolute inset-0 bg-black/60"></div>

            {/* Card */}
            <div className="relative z-10 w-full max-w-md rounded-xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm">

                <h1 className="mb-2 text-center text-4xl font-bold text-blue-700">
                    📋 Gerenciador de Tarefas
                </h1>

                <p className="mb-8 text-center text-gray-600">
                    Organize suas tarefas de forma simples e eficiente
                </p>

                <h2 className="mb-6 text-center text-2xl font-semibold">
                    Login
                </h2>

                <form onSubmit={handleLogin} className="space-y-4">

                    <div>
                        <label className="mb-1 block font-medium">
                            E-mail
                        </label>

                        <input
                            type="email"
                            placeholder="Digite seu e-mail"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block font-medium">
                            Senha
                        </label>

                        <input
                            type="password"
                            placeholder="Digite sua senha"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-center text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 p-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                    <a
                        href="/esqueci-senha"
                        className="text-blue-600 hover:underline"
                    >
                        Esqueci minha senha
</a>

                    <button
                        type="button"
                        onClick={() => router.push("/cadastro")}
                        className="w-full rounded-lg border border-blue-600 p-3 font-medium text-blue-600 transition hover:bg-blue-50"
                    >
                        Criar uma conta
                    </button>

                </form>

            </div>
        </main>
    );
}