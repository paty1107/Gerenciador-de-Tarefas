"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Cadastro() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mensagem, setMensagem] = useState("");

    async function cadastrarUsuario(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setMensagem("");

        try {
            const respostaUsuarios = await fetch(
                "http://localhost:3001/users"
            );

            const usuarios = await respostaUsuarios.json();

            const usuarioExiste = usuarios.some(
                (usuario: { email: string }) =>
                    usuario.email.toLowerCase() ===
                    email.toLowerCase()
            );

            if (usuarioExiste) {
                setMensagem(
                    "Este e-mail já está cadastrado."
                );
                return;
            }

            const resposta = await fetch(
                "http://localhost:3001/users",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                        role: "user",
                        blocked: false,
                    }),
                }
            );

            if (!resposta.ok) {
                throw new Error(
                    "Erro ao cadastrar usuário."
                );
            }

            setMensagem(
                "Usuário cadastrado com sucesso!"
            );

            setEmail("");
            setPassword("");

        } catch (error) {
            console.error(error);
            setMensagem(
                "Erro ao realizar cadastro."
            );
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
                    Criar conta
                </h2>

                <form
                    onSubmit={cadastrarUsuario}
                    className="space-y-4"
                >

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
                            required
                            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
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
                            required
                            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 p-3 font-medium text-white hover:bg-blue-700"
                    >
                        Criar conta
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="w-full rounded-lg border border-blue-600 p-3 font-medium text-blue-600 hover:bg-blue-50"
                    >
                        Já tenho conta
                    </button>

                </form>

                {mensagem && (
                    <p className="mt-4 text-center font-medium">
                        {mensagem}
                    </p>
                )}

            </div>
        </main>
    );
}