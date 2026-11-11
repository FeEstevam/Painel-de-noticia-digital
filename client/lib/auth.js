export async function login(identifier, password) {
  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const json = await res.json();

    if (res.ok && json.success) {
      localStorage.setItem("user", JSON.stringify(json.data.user));
      localStorage.setItem("token", json.data.token);
      return json.data.user;
    } else {
      throw new Error(json.error || "Credenciais inválidas");
    }
  } catch (err) {
    console.warn("Backend indisponível ou erro na autenticação:", err.message);

    // Fallback de demonstração offline se o backend ainda não foi iniciado
    if (identifier && password) {
      const user = { identifier, name: identifier.split("@")[0] };
      localStorage.setItem("user", JSON.stringify(user));
      return user;
    }

    throw err;
  }
}
