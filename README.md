# Painel de Notícias (CashFlow)

Projeto Fullstack configurado com **React (Vite) + Tailwind CSS** no Frontend e **Node.js (Express) + Prisma ORM** no Backend seguindo **Arquitetura MVC (Model-View-Controller)**.

---

## 📖 Documentação Interativa Swagger (OpenAPI 3.0)

A documentação visual e interativa completa da API está disponível via Swagger UI:
- **Interface Swagger UI**: [http://localhost:5000/docs](http://localhost:5000/docs) (ou `/api-docs`)
- **Especificação OpenAPI JSON**: [http://localhost:5000/api/swagger.json](http://localhost:5000/api/swagger.json)
- **Arquivo de Configuração**: [`server/app/swagger/swagger-jsdoc.json`](file:///c:/Users/Computador/Documents/painelDeNoticia/server/app/swagger/swagger-jsdoc.json)

Pela interface Swagger, você pode testar todas as rotas diretamente no navegador com payloads de exemplo e respostas em tempo real.

---

## 🏛️ Arquitetura MVC da API (`server/`)

```
server/
├── app/
│   ├── model/                  # [M] MODEL: Acesso a dados e regras de persistência
│   │   ├── database.js         # Instância Singleton do Prisma Client
│   │   ├── newsModel.js        # Operações de banco para Notícias
│   │   └── userModel.js        # Operações de banco para Usuários
│   │
│   ├── view/                   # [V] VIEW: Formatação e apresentação de dados (JSON DTOs)
│   │   ├── responseView.js     # Padronização de respostas (sucesso, erro, 404)
│   │   ├── newsView.js         # Formatação de notícias, timestamps e cálculo de expiração
│   │   └── userView.js         # Ocultação de dados sensíveis (senhas) e tokens
│   │
│   ├── controller/             # [C] CONTROLLER: Lógica de negócio e coordenação
│   │   ├── newsController.js   # Operações de Notícias (create, delete, getAll)
│   │   └── authController.js   # Login, registro e listagem de usuários
│   │
│   ├── routes/                 # Roteamento Express desacoplado
│   │   ├── index.js            # Agrupador central de rotas (/api)
│   │   ├── newsRoutes.js       # Rotas de Notícias (/api/news)
│   │   └── authRoutes.js       # Rotas de Autenticação (/api/auth)
│   │
│   └── swagger/                # Documentação OpenAPI
│       └── swagger-jsdoc.json  # Especificação OpenAPI 3.0.3 completa
│
├── prisma/
│   ├── schema.prisma           # Modelos Prisma ORM (User, News)
│   └── dev.db                  # Banco de dados SQLite
│
├── server.js                   # Configuração do Express, Swagger UI e middlewares
└── package.json
```

---

## 📡 Endpoints da API

### 📰 Notícias (`/api/news`)
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/news` | Lista notícias (Suporta `?active=true` e `?category=X`) |
| `POST` | `/api/news` | Salva uma nova notícia no banco de dados SQLite (**CREATE**) |
| `DELETE` | `/api/news/:id` | Remove uma notícia do banco de dados SQLite (**DELETE**) |
| `POST` | `/api/news/seed/demo` | Popula o banco com notícias de demonstração caso vazio |

### 🔐 Autenticação e Usuários (`/api/auth`)
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/auth/login` | Realiza login institucional com `identifier` e `password` |
| `POST` | `/api/auth/register` | Cadastra novo usuário com `name`, `email` e `password` |
| `GET` | `/api/auth/users` | Lista usuários cadastrados (sem expor senhas) |

### ⚙️ Status da API
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/status` | Verifica saúde e lista endpoints disponíveis |

---

## 🚀 Como Executar o Projeto

### 1. Iniciar o Servidor Backend (API MVC + Swagger UI)
```powershell
npm run dev:server
```
> O servidor iniciará em `http://localhost:5000`. Acesse a documentação em `http://localhost:5000/docs`.

### 2. Iniciar o Frontend (React)
```powershell
npm run dev:client
```
> O frontend iniciará em `http://localhost:3000`.

### 3. Abrir o Prisma Studio
```powershell
npm run prisma:studio
```
> Interface gráfica no navegador para visualizar os registros do banco SQLite.
