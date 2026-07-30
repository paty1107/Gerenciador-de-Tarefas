"use client";

import { useState } from "react";

const API_URL = "http://localhost:3001";

export default function EsqueciSenha() {

    const [email, setEmail] = useState("");

    async function recuperarSenha() {

        const response = await fetch(
            `${API_URL}/users?email=${email}`
        );

        const users = await response.json();

        if (users.length === 0) {
            alert("E-mail não encontrado.");
            return;
        }

        const token = crypto.randomUUID();

        await fetch(
            `${API_URL}/users/${users[0].id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    resetToken: token
                })
            }
        );

        window.location.href = `/nova-senha/${token}`;
    }


    return (
        <main className="flex min-h-screen items-center justify-center">

            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">

                <h1 className="mb-5 text-2xl font-bold">
                    Recuperar senha
                </h1>


                <input
                    className="mb-4 w-full rounded border p-3"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />


                <button
                    onClick={recuperarSenha}
                    className="w-full rounded bg-blue-600 p-3 text-white"
                >
                    Recuperar senha
                </button>

            </div>

        </main>
    );
}