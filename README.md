### 🛡️ Architecture Réseau et Flux de Données

```mermaid
graph TD
    User((🌐 Internet)) -->|WAF / HTTPS| LB[⚖️ Load Balancer]
    
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
