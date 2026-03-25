# RCM_LYS

### 🛡️ Architecture Réseau et Flux de Données

```mermaid
graph TD
    User((🌐 Internet)) -->|WAF / HTTPS| [API gateway]
    
    subgraph "Public Subnet (DMZ)"
        LB
        Bastion[🛡️ Bastion Host]
    end

    subgraph "Private Subnet (App Layer)"
        LB --> Auth[🔐 Auth]
        LB --> Users[👤 Users]
        LB --> Payments[💳 Payments]
        LB --> Worksites[🚧 Worksites]
        
        Payments -->|API| Stripe((🌍 Stripe API))
        Worksites -->|Upload| S3((☁️ AWS S3 Storage))
    end

    subgraph "Database Subnet (Data Layer)"
        Auth --> DB_A[(🗄️ Auth DB)]
        Payments --> DB_P[(🗄️ Payments DB)]
        Worksites --> DB_W[(🗄️ Worksites DB)]
        Bastion -.->|Admin Only| DB_A
    end

    NAT[🛠️ NAT Gateway] -.->|Sortie Sécurisée| Stripe
### 📊 Matrice de Flux Réseau

Le tableau suivant définit les flux de communication autorisés au sein de l'infrastructure. Par principe de sécurité, tout flux non explicitement listé ici est **interdit (Default Deny)**.

| Source | Destination | Port / Protocole | Description & Justification Cyber |
| :--- | :--- | :--- | :--- |
| **🌐 Utilisateur (Internet)** | **🚀 API Gateway** | `HTTPS (443)` | Point d'entrée unique. Filtrage WAF et terminaison TLS. |
| **🚀 API Gateway** | **🔐 Auth Service** | `HTTP/HTTPS` | Routage du flux `/auth`. Gestion des sessions et tokens. |
| **🚀 API Gateway** | **👤 Users Service** | `HTTP/HTTPS` | Routage du flux `/users`. Consultation/Édition de profils. |
| **🚀 API Gateway** | **💳 Payments Service** | `HTTP/HTTPS` | Routage du flux `/pay`. Isolation des fonctions monétaires. |
| **🚀 API Gateway** | **🚧 Worksites Service** | `HTTP/HTTPS` | Routage du flux `/work`. Gestion des chantiers. |
| **🏗️ Micro-services** | **🗄️ Databases (MySQL)** | `SQL (3306)` | Accès restreint : un service ne voit que sa propre BDD. |
| **💳 Payments Service** | **🌍 Stripe API** | `HTTPS (443)` | Externalisation des paiements (Conformité PCI-DSS). |
| **🚧 Worksites Service** | **☁️ AWS S3** | `HTTPS (443)` | Stockage déporté des photos et documents lourds. |
| **👤 Admin (Distanciel)** | **🛡️ Bastion Host** | `SSH (22)` | Seul accès d'administration autorisé (via VPN/IP fixe). |
| **🛡️ Bastion Host** | **🏗️ Zone Privée** | `Interne` | Administration et maintenance des serveurs et BDD. |
