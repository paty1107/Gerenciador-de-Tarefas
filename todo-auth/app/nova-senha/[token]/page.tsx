"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

const API_URL = "http://localhost:3001";


export default function NovaSenha() {

    const params = useParams();

    const token = params.token;


    const [senha, setSenha] = useState("");


    async function salvarSenha() {


        const response = await fetch(
            `${API_URL}/users?resetToken=${token}`
        );


        const users = await response.json();


        if (users.length === 0) {
            alert("Token inválido.");
            return;
        }


        await fetch(
            `${API_URL}/users/${users[0].id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    password: senha,
                    resetToken: null
                })
            }
        );


        alert(
            "Senha alterada com sucesso!"
        );

    }



    return (

        <main className="flex min-h-screen items-center justify-center">

            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">


                <h1 className="mb-5 text-2xl font-bold">
                    Nova senha
                </h1>


                <input
                    type="password"
                    className="mb-4 w-full rounded border p-3"
                    placeholder="Nova senha"
                    value={senha}
                    onChange={(e) =>
                        setSenha(e.target.value)
                    }
                />


                <button
                    onClick={salvarSenha}
                    className="w-full rounded bg-green-600 p-3 text-white"
                >
                    Salvar senha
                </button>


            </div>

        </main>

    );
}