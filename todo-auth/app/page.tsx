export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="rounded-xl bg-white p-10 shadow-lg">
        <h1 className="mb-4 text-3xl font-bold">
          Lista de Tarefas
        </h1>

        <p className="mb-6 text-gray-600">
          Gerencie suas tarefas de forma simples.
        </p>

        <div className="flex gap-4">
          <button className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">
            Entrar
          </button>

          <button className="rounded-lg border border-gray-300 px-5 py-2 hover:bg-gray-100">
            Criar conta
          </button>
        </div>
      </div>
    </main>
  );
}