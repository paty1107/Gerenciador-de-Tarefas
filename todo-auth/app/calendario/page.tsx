"use client";

import { useEffect, useState } from "react";

type Task = {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    dueDate?: string;
    dueTime?: string;
};

const API_URL = "http://localhost:3001";


export default function Calendario() {

    const [tasks, setTasks] = useState<Task[]>([]);


    useEffect(() => {

        carregarTarefas();

    }, []);



    async function carregarTarefas() {

        const response = await fetch(
            `${API_URL}/tasks`
        );

        const data = await response.json();

        setTasks(data);

    }



    const tarefasPorData = tasks.reduce(
        (acc: any, task) => {

            const data = task.dueDate || "Sem data";

            if (!acc[data]) {
                acc[data] = [];
            }

            acc[data].push(task);

            return acc;

        },
        {}
    );



    return (

        <main className="min-h-screen bg-gray-100 p-6">

            <h1 className="mb-6 text-3xl font-bold">
                📅 Calendário de tarefas
            </h1>


            <div className="grid gap-5 md:grid-cols-3">


                {Object.entries(tarefasPorData)
                    .map(([data, tarefas]: any) => (


                        <div
                            key={data}
                            className="rounded-xl bg-white p-5 shadow"
                        >

                            <h2 className="mb-4 text-xl font-bold">
                                📅 {data}
                            </h2>


                            {tarefas.map((task: Task) => (

                                <div
                                    key={task.id}
                                    className="mb-3 rounded-lg border p-3"
                                >

                                    <h3 className="font-semibold">
                                        {task.title}
                                    </h3>


                                    <p className="text-sm text-gray-600">
                                        {task.description}
                                    </p>


                                    {task.dueTime && (
                                        <p>
                                            ⏰ {task.dueTime}
                                        </p>
                                    )}


                                    <p>
                                        {
                                            task.completed
                                                ? "✅ Concluída"
                                                : "⏳ Pendente"
                                        }
                                    </p>


                                </div>

                            ))}


                        </div>


                    ))}


            </div>


        </main>

    );

}