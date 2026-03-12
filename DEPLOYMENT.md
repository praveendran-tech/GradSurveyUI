# Graduate Survey UI — Deployment Guide

This document covers everything needed to deploy, maintain, and troubleshoot the Graduate Survey application on AWS EC2. It is written for someone with no prior AWS or server experience. Every command is fully copy-pasteable.

---

## Table of Contents

1. [Getting AWS Access (UMD)](#1-getting-aws-access-umd)
2. [Application Overview](#2-application-overview)
3. [Project Structure](#3-project-structure)
4. [Environment Variables (.env)](#4-environment-variables-env)
5. [Prerequisites](#5-prerequisites)
6. [First-Time Deployment](#6-first-time-deployment)
   - [Step 1 — Launch an EC2 Instance](#step-1--launch-an-ec2-instance)
   - [Step 2 — Allocate a Permanent Public IP](#step-2--allocate-a-permanent-public-ip)
   - [Step 3 — Open Firewall Ports](#step-3--open-firewall-ports)
   - [Step 4 — Connect to the Server](#step-4--connect-to-the-server)
   - [Step 5 — Install Server Dependencies](#step-5--install-server-dependencies)
   - [Step 6 — Upload the Project](#step-6--upload-the-project)
   - [Step 7 — Set Up the Python Backend](#step-7--set-up-the-python-backend)
   - [Step 8 — Build the React Frontend](#step-8--build-the-react-frontend)
   - [Step 9 — Create the Backend System Service](#step-9--create-the-backend-system-service)
   - [Step 10 — Configure Nginx Web Server](#step-10--configure-nginx-web-server)
   - [Step 11 — Verify Everything Works](#step-11--verify-everything-works)
7. [Redeployment After Code Changes](#7-redeployment-after-code-changes)
8. [Server Management](#8-server-management)
9. [Monitoring & Logs](#9-monitoring--logs)
10. [Backup & Recovery](#10-backup--recovery)
11. [Adding HTTPS / SSL](#11-adding-https--ssl)
12. [Scaling & Performance](#12-scaling--performance)
13. [Cost Management](#13-cost-management)
14. [Troubleshooting](#14-troubleshooting)
15. [UMD-Specific AWS Notes](#15-umd-specific-aws-notes)
16. [Current Deployment Reference](#16-current-deployment-reference)
17. [API Reference](#17-api-reference)
18. [Contacts & Support](#18-contacts--support)

---

## 1. Getting AWS Access (UMD)

This application runs on the University of Maryland's AWS environment. You cannot deploy without AWS access.

> **To request AWS access**, follow the instructions in the UMD IT Knowledge Base:
> [https://itsupport.umd.edu/itsupport?id=kb_article_view&sysparm_article=KB0016087](https://itsupport.umd.edu/itsupport?id=kb_article_view&sysparm_article=KB0016087&sys_kb_id=1557af4f1bb9415009f28734ec4bcbd0&spa=1)

**If you need access or the link does not work, reach out to Sharon.** She manages AWS access for the department.

Once you have access:
1. Go to [https://console.aws.amazon.com](https://console.aws.amazon.com)
2. Log in with your UMD credentials
3. Confirm you can see the EC2 dashboard

> **Note:** UMD AWS accounts are managed under a shared university VPC (`prod-sharedvpc1-dept-vpc`). You must deploy into a **public subnet** — private subnets in this VPC do not have internet access. See [UMD-Specific AWS Notes](#15-umd-specific-aws-notes) for details.

---

## 2. Application Overview

### What it does
The Graduate Survey UI is an internal tool for managing and reporting on graduate student outcomes. It pulls data from Qualtrics surveys, LinkedIn, and the National Student Clearinghouse, and allows staff to review, reconcile, and export outcome records.

### Architecture

```
User Browser
     │
     ▼
EC2 Instance (Ubuntu 22.04)
     │
     ├── Nginx (port 80)
     │      ├── GET /          → serves React app (dist/index.html)
     │      ├── GET /assets/*  → serves JS/CSS/images
     │      └── /api/*         → proxied to FastAPI on localhost:8000
     │
     └── FastAPI / uvicorn (port 8000, localhost only)
              │
              └── PostgreSQL Database (external, credentials in .env)
                       ├── src.src_qualtrics_response
                       ├── src.src_linkedin_position
                       ├── src.src_clearinghouse_record
                       ├── src.src_demographics
                       └── analytics.master_graduate_outcomes
```

### Technology stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript | 18.x |
| Frontend build | Vite | 5.x |
| Backend | FastAPI (Python) | 0.100+ |
| Backend server | uvicorn | 0.20+ |
| Web server / proxy | Nginx | 1.24 |
| Database driver | psycopg (v3) | 3.x |
| Database | PostgreSQL | External |
| Process manager | systemd | Ubuntu built-in |
| OS | Ubuntu Server | 22.04 LTS |

### How requests flow

1. User opens the app in their browser
2. Browser loads the React app from Nginx
3. React app makes API calls to `/api/...`
4. Nginx proxies those calls to FastAPI on port 8000
5. FastAPI queries the PostgreSQL database and returns JSON
6. React displays the results

---

## 3. Project Structure

```
GradSurveyUI/
├── src/                        # React frontend source
│   ├── api.ts                  # All API calls to the backend
│   ├── types.ts                # TypeScript type definitions
│   ├── majorData.ts            # Static list of majors and schools
│   ├── components/             # Reusable UI components
│   └── pages/                  # One file per page
│       ├── LandingPage.tsx
│       ├── DataManagementPage.tsx   # Main dashboard
│       ├── ReportPage.tsx           # Major reports
│       ├── DownloadPage.tsx         # CSV export
│       └── ...
├── dist/                       # Built frontend (generated, not in git)
├── backend/
│   ├── main.py                 # FastAPI app, all routes
│   ├── database.py             # All database queries
│   ├── report.py               # Report generation (DOCX + JSON)
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Database credentials (NOT in git)
│   └── venv/                   # Python virtual environment (generated)
├── public/                     # Static assets
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite build config
├── tsconfig.app.json           # TypeScript config
├── package.json                # Node.js dependencies
└── DEPLOYMENT.md               # This file
```

---

## 4. Environment Variables (.env)

The backend requires a `.env` file at `backend/.env`. This file is **not stored in git** and must be obtained from the previous maintainer or Sharon.

```env
DB_HOST=<database host>
DB_PORT=5432
DB_NAME=<database name>
DB_USER=<database username>
DB_PASSWORD=<database password>
```

> **Never commit `.env` to git.** It contains database credentials. If you accidentally commit it, change the database password immediately.

To verify the database connection works:
```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP
source /home/ubuntu/GradSurveyUI/backend/venv/bin/activate
cd /home/ubuntu/GradSurveyUI/backend
python3 -c "import database; print('DB connection OK')"
```

---

## 5. Prerequisites

### On your local Mac / Windows machine

- [ ] **AWS Console access** — see Section 1
- [ ] **The `.env` file** — get from Sharon or previous maintainer
- [ ] **The project source code** — this repository
- [ ] **The `gradsurvey-key.pem` SSH key file** — created when launching EC2, or get from Sharon
- [ ] **Node.js 18+** — download from [https://nodejs.org](https://nodejs.org)
- [ ] **rsync** — pre-installed on Mac; on Windows use WSL or Git Bash
- [ ] **Terminal / command line** — Mac: built-in Terminal app; Windows: use Git Bash or WSL

### Verify Node.js is installed (Mac Terminal):
```bash
node --version   # must show v18.x.x or higher
npm --version    # must show 9.x.x or higher
```

If not installed, download from [https://nodejs.org](https://nodejs.org) → choose the LTS version.

---

## 6. First-Time Deployment

Work through these steps in order. Each step builds on the previous one.

> **Time estimate:** ~30–45 minutes for a first-time deployment.

---

### Step 1 — Launch an EC2 Instance

1. Log in to [console.aws.amazon.com](https://console.aws.amazon.com)
2. Confirm the region in the **top-right corner** — it should say **US East (Ohio)** or **US East (N. Virginia)**. Click it to change if needed.
3. Click **EC2** in the services menu (or search for it)
4. Click **Launch Instance** (orange button)

Fill in the following settings:

**Name and tags:**
| Field | Value |
|-------|-------|
| Name | `GradSurvey` |

**Application and OS Images (AMI):**
| Field | Value |
|-------|-------|
| AMI | Ubuntu Server 22.04 LTS (HVM), SSD Volume Type |

Search for "Ubuntu 22.04" if it doesn't appear by default. Make sure it says **Free tier eligible**.

**Instance type:**
| Field | Value |
|-------|-------|
| Instance type | `t3.small` (2 vCPU, 2 GB RAM) |

> `t3.small` is recommended. `t3.micro` (1 GB RAM) may run out of memory when building the frontend or serving many users simultaneously.

**Key pair (login):**

Click **Create new key pair**:
| Field | Value |
|-------|-------|
| Key pair name | `gradsurvey-key` |
| Key pair type | RSA |
| Private key file format | `.pem` |

Click **Create key pair** — the file downloads automatically to your Downloads folder.

> **Critical:** Move this file somewhere safe immediately. You cannot download it again. If you lose it, you will not be able to SSH into the server and will need to create a new instance.

**Network settings — click Edit:**
| Field | Value |
|-------|-------|
| VPC | `prod-sharedvpc1-dept-vpc` |
| Subnet | `prod-sharedvpc1-dept-public1` OR `prod-sharedvpc1-dept-public2` |
| Auto-assign public IP | **Enable** |

> **Critical:** You MUST choose a subnet with "public" in the name. Subnets with "private" in the name have no internet access and you will not be able to reach your server.

**Firewall (Security groups):**

Select **Create security group** and add:
| Type | Protocol | Port | Source |
|------|----------|------|--------|
| SSH | TCP | 22 | Anywhere — 0.0.0.0/0 |
| HTTP | TCP | 80 | Anywhere — 0.0.0.0/0 |

**Configure storage:**
| Field | Value |
|-------|-------|
| Root volume | 20 GiB (gp3) — increase from 8 GiB default |

5. Click **Launch Instance**
6. Click **View all instances** and wait for the **Instance state** to change to **Running** and **Status check** to show **2/2 checks passed** (takes about 1–2 minutes)

---

### Step 2 — Allocate a Permanent Public IP

By default, an EC2 instance gets a new IP address every time it restarts. An **Elastic IP** gives you a fixed, permanent IP.

1. In the EC2 left sidebar → scroll to **Network & Security** → click **Elastic IPs**
2. Click **Allocate Elastic IP address**
3. Leave all settings as default → click **Allocate**
4. The new IP appears in the list — **write it down**
5. Check the checkbox next to the new IP
6. Click **Actions** → **Associate Elastic IP address**
7. Under **Instance**, click the dropdown and select `GradSurvey`
8. Click **Associate**

The IP column on your instance in the EC2 dashboard will now show this fixed IP. Use this IP for all commands below — replace `YOUR_EC2_IP` with it.

> **Note:** Elastic IPs are free while associated with a running instance. If you stop the instance and the IP is unassociated, AWS charges ~$0.005/hour. Always associate the IP before stopping the instance, or release it when decommissioning.

---

### Step 3 — Open Firewall Ports

The security group created in Step 1 should already have SSH (22) and HTTP (80) open. Verify:

1. EC2 → Instances → click `GradSurvey` → click **Security** tab
2. Click the security group link (looks like `sg-xxxxxxxxx`)
3. Click **Inbound rules** tab
4. You should see rules for port 22 and port 80

If either is missing, click **Edit inbound rules** → **Add rule** → add the missing port → **Save rules**.

---

### Step 4 — Connect to the Server

Open **Terminal** on your Mac (press `Cmd+Space`, type "Terminal", press Enter).

Move your key file and set the correct permissions:
```bash
mv ~/Downloads/gradsurvey-key.pem ~/Desktop/gradsurvey-key.pem
chmod 400 ~/Desktop/gradsurvey-key.pem
```

Connect to the server:
```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP
```

You will see a warning like:
```
The authenticity of host 'x.x.x.x' can't be established.
Are you sure you want to continue connecting (yes/no)?
```
Type `yes` and press Enter. This is normal on the first connection.

You should now see a prompt like `ubuntu@ip-10-14-xxx-xxx:~$` — you are inside the server.

> **Commands in the next steps that say "run inside the server" must be run while you see this prompt.**
> Type `exit` to leave the server at any time.

---

### Step 5 — Install Server Dependencies

Run these commands **inside the server**:

```bash
# Update package list
sudo apt update

# Install all required software
sudo apt install -y python3-pip python3-venv nginx nodejs npm

# Verify
node --version     # v18.x.x or higher
python3 --version  # 3.10.x or higher
nginx -v           # nginx/1.24.x
```

Type `exit` to leave the server.

---

### Step 6 — Upload the Project

Run these commands **on your Mac** (not inside the server).

First, find the path to the project on your Mac:
```bash
# Example — adjust to where you cloned the repo
ls ~/Desktop/GradSurveyUI/
```

Upload the project (replace `/Users/yourname/Desktop/GradSurveyUI/` with your actual path):
```bash
rsync -avz \
  --exclude='node_modules' \
  --exclude='backend/venv' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='__pycache__' \
  -e "ssh -i ~/Desktop/gradsurvey-key.pem" \
  /Users/yourname/Desktop/GradSurveyUI/ \
  ubuntu@YOUR_EC2_IP:/home/ubuntu/GradSurveyUI/
```

Upload the `.env` file (database credentials):
```bash
scp -i ~/Desktop/gradsurvey-key.pem \
  /Users/yourname/Desktop/GradSurveyUI/backend/.env \
  ubuntu@YOUR_EC2_IP:/home/ubuntu/GradSurveyUI/backend/.env
```

> **Why exclude those folders?** `node_modules` and `venv` contain thousands of files that will be regenerated on the server. `.git` is version control history not needed on the server. `dist` is the built frontend that will be rebuilt on the server. Excluding them makes the upload fast.

---

### Step 7 — Set Up the Python Backend

SSH back into the server:
```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP
```

Create and activate a Python virtual environment, then install dependencies:
```bash
cd /home/ubuntu/GradSurveyUI/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Test that the backend starts without errors (press `Ctrl+C` to stop it after testing):
```bash
uvicorn main:app --host 127.0.0.1 --port 8000
```

You should see:
```
INFO:     Started server process [xxxx]
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

Press `Ctrl+C`, then type `exit` to leave the server.

---

### Step 8 — Build the React Frontend

SSH into the server and make the production-specific changes, then build:

```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP
cd /home/ubuntu/GradSurveyUI

# 1. Point the frontend to the relative API path (works behind Nginx)
sed -i 's|http://localhost:8000/api|/api|g' src/api.ts

# 2. Relax TypeScript strictness settings that block the build
sed -i 's/"noUnusedLocals": true/"noUnusedLocals": false/' tsconfig.app.json
sed -i 's/"noUnusedParameters": true/"noUnusedParameters": false/' tsconfig.app.json

# 3. Fix a type cast in DownloadPage
sed -i 's/exportData.records as MasterRecord\[\]/exportData.records as unknown as MasterRecord[]/g' src/pages/DownloadPage.tsx

# 4. Install Node.js dependencies
npm install

# 5. Build the production bundle
npm run build
```

This creates the `dist/` folder containing the compiled React app.

Type `exit` to leave the server.

> **Why change api.ts?** Locally the frontend calls `http://localhost:8000/api` directly. In production, Nginx is the middleman, so we use the relative path `/api` which Nginx then proxies to the backend. Without this change, the deployed app would try to connect to localhost on the user's own computer.

---

### Step 9 — Create the Backend System Service

This creates a **systemd service** that:
- Starts the backend automatically when the server boots
- Restarts it automatically if it crashes
- Runs it as the `ubuntu` user with the correct environment

SSH into the server and run:

```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP
```

```bash
sudo tee /etc/systemd/system/gradsurvey.service > /dev/null << 'EOF'
[Unit]
Description=GradSurvey FastAPI Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/GradSurveyUI/backend
ExecStart=/home/ubuntu/GradSurveyUI/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3
EnvironmentFile=/home/ubuntu/GradSurveyUI/backend/.env
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
```

Enable and start it:
```bash
sudo systemctl daemon-reload
sudo systemctl enable gradsurvey
sudo systemctl start gradsurvey
```

Verify it is running:
```bash
sudo systemctl status gradsurvey
```

You should see `Active: active (running)`. If it shows `failed`, check the logs:
```bash
sudo journalctl -u gradsurvey -n 50 --no-pager
```

Type `exit` to leave the server.

---

### Step 10 — Configure Nginx Web Server

SSH into the server and create the Nginx configuration:

```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP
```

```bash
sudo tee /etc/nginx/sites-available/gradsurvey > /dev/null << 'EOF'
server {
    listen 80 default_server;
    server_name _;

    # Serve the React app
    root /home/ubuntu/GradSurveyUI/dist;
    index index.html;

    # React client-side routing — all unknown paths serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy all /api/* requests to the FastAPI backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        client_max_body_size 50M;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;
}
EOF
```

Activate the config:
```bash
# Enable the site
sudo ln -sf /etc/nginx/sites-available/gradsurvey /etc/nginx/sites-enabled/gradsurvey

# Remove the default Nginx page
sudo rm -f /etc/nginx/sites-enabled/default

# Fix permissions so Nginx can read files in the ubuntu home directory
chmod 755 /home/ubuntu
chmod -R 755 /home/ubuntu/GradSurveyUI/dist

# Test the config (must say "test is successful")
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

Type `exit` to leave the server.

---

### Step 11 — Verify Everything Works

From your Mac, run a quick check:
```bash
# Check the frontend loads
curl -s http://YOUR_EC2_IP | head -5
# Should return: <!doctype html>...

# Check the API responds
curl -s http://YOUR_EC2_IP/api/filters/terms
# Should return: {"terms":["202508","202507"]}
```

Open a browser and navigate to `http://YOUR_EC2_IP` — you should see the full application.

**Deployment is complete.**

---

## 7. Redeployment After Code Changes

### Quick reference — pick the scenario that matches your change:

| What changed | Command(s) needed |
|---|---|
| Frontend only (React/TypeScript) | Upload + `npm run build` |
| Backend only (Python) | Upload + restart service |
| Both frontend and backend | Upload + build + restart |
| New Python package | Upload + `pip install` + restart |
| `.env` / database credentials | `scp` + restart |
| Nginx config | Edit on server + `sudo nginx -t && sudo systemctl reload nginx` |

---

### Reusable upload command (save this)

Create a shell alias on your Mac so you don't have to type the full command each time. Add this to your `~/.zshrc`:

```bash
alias gradsurvey-upload='rsync -avz \
  --exclude="node_modules" \
  --exclude="backend/venv" \
  --exclude="dist" \
  --exclude=".git" \
  --exclude="__pycache__" \
  -e "ssh -i ~/Desktop/gradsurvey-key.pem" \
  /Users/yourname/Desktop/GradSurveyUI/ \
  ubuntu@YOUR_EC2_IP:/home/ubuntu/GradSurveyUI/'
```

Run `source ~/.zshrc` to activate it. Then just type `gradsurvey-upload`.

---

### Frontend-only changes

```bash
# From your Mac:
rsync -avz \
  --exclude='node_modules' --exclude='backend/venv' --exclude='dist' --exclude='.git' \
  -e "ssh -i ~/Desktop/gradsurvey-key.pem" \
  /Users/yourname/Desktop/GradSurveyUI/ ubuntu@YOUR_EC2_IP:/home/ubuntu/GradSurveyUI/

ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP \
  "cd /home/ubuntu/GradSurveyUI && npm run build && chmod -R 755 dist/"
```

No service restart needed. Users will see the new version on their next page load.

---

### Backend-only changes

```bash
# From your Mac:
rsync -avz \
  --exclude='node_modules' --exclude='backend/venv' --exclude='dist' --exclude='.git' \
  -e "ssh -i ~/Desktop/gradsurvey-key.pem" \
  /Users/yourname/Desktop/GradSurveyUI/ ubuntu@YOUR_EC2_IP:/home/ubuntu/GradSurveyUI/

ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP \
  "sudo systemctl restart gradsurvey && sleep 2 && sudo systemctl status gradsurvey --no-pager"
```

---

### Both frontend and backend changed

```bash
# From your Mac:
rsync -avz \
  --exclude='node_modules' --exclude='backend/venv' --exclude='dist' --exclude='.git' \
  -e "ssh -i ~/Desktop/gradsurvey-key.pem" \
  /Users/yourname/Desktop/GradSurveyUI/ ubuntu@YOUR_EC2_IP:/home/ubuntu/GradSurveyUI/

ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP \
  "cd /home/ubuntu/GradSurveyUI && npm run build && chmod -R 755 dist/ && sudo systemctl restart gradsurvey"
```

---

### New Python package added

1. Add the package to `backend/requirements.txt` in your local project
2. Upload and install:

```bash
rsync -avz \
  --exclude='node_modules' --exclude='backend/venv' --exclude='dist' --exclude='.git' \
  -e "ssh -i ~/Desktop/gradsurvey-key.pem" \
  /Users/yourname/Desktop/GradSurveyUI/ ubuntu@YOUR_EC2_IP:/home/ubuntu/GradSurveyUI/

ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP \
  "source /home/ubuntu/GradSurveyUI/backend/venv/bin/activate && \
   pip install -r /home/ubuntu/GradSurveyUI/backend/requirements.txt && \
   sudo systemctl restart gradsurvey"
```

---

### Updated .env / database credentials

```bash
scp -i ~/Desktop/gradsurvey-key.pem \
  /Users/yourname/Desktop/GradSurveyUI/backend/.env \
  ubuntu@YOUR_EC2_IP:/home/ubuntu/GradSurveyUI/backend/.env

ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP \
  "sudo systemctl restart gradsurvey"
```

---

### One-line full redeploy (upload + build + restart everything)

Use this when you are unsure what changed or want to do a full clean deploy:

```bash
rsync -avz \
  --exclude='node_modules' --exclude='backend/venv' --exclude='dist' --exclude='.git' \
  -e "ssh -i ~/Desktop/gradsurvey-key.pem" \
  /Users/yourname/Desktop/GradSurveyUI/ ubuntu@YOUR_EC2_IP:/home/ubuntu/GradSurveyUI/ && \
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP \
  "cd /home/ubuntu/GradSurveyUI && \
   npm run build && \
   chmod -R 755 dist/ && \
   source backend/venv/bin/activate && \
   pip install -r backend/requirements.txt && \
   sudo systemctl restart gradsurvey && \
   sudo systemctl reload nginx && \
   echo 'DEPLOY COMPLETE'"
```

---

## 8. Server Management

### SSH into the server
```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP
```

### Backend service commands
```bash
sudo systemctl start gradsurvey      # start
sudo systemctl stop gradsurvey       # stop
sudo systemctl restart gradsurvey    # restart (use after code changes)
sudo systemctl reload gradsurvey     # graceful reload (not supported — use restart)
sudo systemctl status gradsurvey     # check if running
sudo systemctl enable gradsurvey     # make it start on server boot
sudo systemctl disable gradsurvey    # stop it from starting on boot
```

### Nginx commands
```bash
sudo systemctl start nginx           # start
sudo systemctl stop nginx            # stop
sudo systemctl restart nginx         # full restart
sudo systemctl reload nginx          # reload config without downtime
sudo systemctl status nginx          # check if running
sudo nginx -t                        # test config for syntax errors
```

### Stop and start the entire server (from AWS console)
EC2 → Instances → select GradSurvey → **Instance state**:
- **Stop** — shuts down the server (you are not billed for compute while stopped, but Elastic IP and storage still cost money)
- **Start** — starts it back up (services start automatically)
- **Reboot** — full restart (services restart automatically)
- **Terminate** — permanently deletes the server (cannot be undone)

> After a stop/start cycle, services start automatically because we ran `sudo systemctl enable gradsurvey`.

---

## 9. Monitoring & Logs

### View backend logs (most recent 100 lines)
```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP \
  "sudo journalctl -u gradsurvey -n 100 --no-pager"
```

### Stream backend logs in real-time (watch live)
```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP \
  "sudo journalctl -u gradsurvey -f"
```
Press `Ctrl+C` to stop.

### View Nginx access log (who visited the app)
```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP \
  "sudo tail -100 /var/log/nginx/access.log"
```

### View Nginx error log
```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP \
  "sudo tail -50 /var/log/nginx/error.log"
```

### Check server resource usage
```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP "
echo '=== CPU & Memory ===' && top -b -n1 | head -20
echo ''
echo '=== Disk usage ===' && df -h
echo ''
echo '=== Memory ===' && free -h
echo ''
echo '=== Services ===' && sudo systemctl status gradsurvey --no-pager && sudo systemctl status nginx --no-pager
"
```

### AWS CloudWatch (basic metrics in the console)
EC2 → Instances → select GradSurvey → **Monitoring** tab

You can see CPU utilization, network in/out, disk reads/writes over time without installing anything extra.

---

## 10. Backup & Recovery

### What needs to be backed up

| Item | Where it lives | How to back up |
|------|---------------|----------------|
| Source code | Your Mac + git | Push to git regularly |
| `.env` file | `backend/.env` | Store securely outside git (e.g., password manager, SharePoint) |
| Database | External PostgreSQL server | Managed separately — not on EC2 |
| SSH key | `gradsurvey-key.pem` | Keep a secure copy (password manager, encrypted drive) |

> The EC2 server itself is **not** a primary data store — all persistent data is in the external PostgreSQL database. If the server is lost, you can redeploy from scratch in ~30 minutes using this guide.

### Back up the .env file now
```bash
# Copy it to a safe local location (not in the git repo)
cp /Users/yourname/Desktop/GradSurveyUI/backend/.env ~/Documents/gradsurvey-env-backup.env
```

### If you need to rebuild the server from scratch
1. Launch a new EC2 instance (Section 6, Step 1)
2. Associate the existing Elastic IP to the new instance (Section 6, Step 2)
3. Follow Steps 3–11 of First-Time Deployment
4. The app will be back up and connected to the same database — no data is lost

### Create an AMI snapshot (server image backup)
EC2 → Instances → select GradSurvey → **Actions** → **Image and templates** → **Create image**

This saves a complete snapshot of the server that you can restore to a new instance instantly. Recommended before major changes.

---

## 11. Adding HTTPS / SSL

HTTPS encrypts traffic between users and the server. Currently the app runs on HTTP only. To add HTTPS:

### Requirements
- Port 443 must be open in the Security Group (add HTTPS rule same as SSH/HTTP)
- A domain name (or use a free sslip.io address)

### Add port 443 to the security group
EC2 → Security Groups → your security group → Edit inbound rules → Add rule:
| Type | Port | Source |
|------|------|--------|
| HTTPS | 443 | Anywhere (0.0.0.0/0) |

### Option A — Free URL using sslip.io (no domain purchase needed)

Your URL will be: `https://YOUR_EC2_IP_WITH_DASHES.sslip.io`

For example, if your IP is `3.81.38.238`, your URL will be `https://3-81-38-238.sslip.io`

```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace IP dashes appropriately)
sudo certbot --nginx -d YOUR-IP-WITH-DASHES.sslip.io \
  --non-interactive --agree-tos --email YOUR_EMAIL --redirect

# Verify auto-renewal is set up
sudo certbot renew --dry-run
```

### Option B — Custom domain (e.g., gradsurvey.duckdns.org)

1. Go to [duckdns.org](https://www.duckdns.org) → log in with Google
2. Enter your desired subdomain (e.g., `gradsurvey`) → click **Add domain**
3. Set the IP to your EC2 Elastic IP → click **Update IP**
4. SSH into your server and run:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d gradsurvey.duckdns.org \
  --non-interactive --agree-tos --email YOUR_EMAIL --redirect
```

### Update CORS after adding HTTPS

After adding SSL, update `backend/main.py` CORS settings to include the new domain:
```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP \
  "sed -i 's|allow_origins=\[|allow_origins=[\"https://YOUR_DOMAIN\", |' \
  /home/ubuntu/GradSurveyUI/backend/main.py && \
  sudo systemctl restart gradsurvey"
```

---

## 12. Scaling & Performance

### Current capacity
The `t3.small` instance handles light to moderate usage (a few simultaneous users). For heavier load:

### Upgrade the instance type (vertical scaling)
1. EC2 → Instances → select GradSurvey → **Instance state** → **Stop**
2. Wait for it to stop
3. **Actions** → **Instance settings** → **Change instance type**
4. Select `t3.medium` (4 GB RAM) or `t3.large` (8 GB RAM)
5. **Instance state** → **Start**

Costs (approximate, us-east-1):
| Type | vCPU | RAM | Cost/month |
|------|------|-----|------------|
| t3.micro | 2 | 1 GB | ~$8 |
| t3.small | 2 | 2 GB | ~$15 |
| t3.medium | 2 | 4 GB | ~$30 |
| t3.large | 2 | 8 GB | ~$60 |

### Run multiple backend workers (handle more concurrent API requests)
Edit the systemd service:
```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP
sudo nano /etc/systemd/system/gradsurvey.service
```

Change the `ExecStart` line to use multiple workers:
```
ExecStart=/home/ubuntu/GradSurveyUI/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 2
```

Then reload:
```bash
sudo systemctl daemon-reload && sudo systemctl restart gradsurvey
```

> Use `--workers 2` for t3.small (2 vCPU). Never use more workers than vCPUs.

---

## 13. Cost Management

### Estimated monthly costs (us-east-1)

| Resource | Approximate Cost |
|---------|-----------------|
| EC2 t3.small (running 24/7) | ~$15/month |
| Elastic IP (associated) | Free |
| Elastic IP (unassociated) | ~$3.60/month |
| EBS storage (20 GB gp3) | ~$1.60/month |
| Data transfer out (first 100 GB) | ~$9/month |
| **Total estimate** | **~$25/month** |

### Save money when not in use
- **Stop the instance** when not in active use (nights/weekends) — no compute charges while stopped
- Storage and Elastic IP still cost a small amount while stopped
- Services restart automatically when you start it again

### Stop the instance (from your Mac)
You can stop/start from the AWS console or using the AWS CLI:
```bash
# Requires AWS CLI installed and configured
aws ec2 stop-instances --instance-ids YOUR_INSTANCE_ID --region us-east-1
aws ec2 start-instances --instance-ids YOUR_INSTANCE_ID --region us-east-1
```

---

## 14. Troubleshooting

### App shows "404 Not Found" from Nginx

**Cause:** Nginx can't find the `dist/` folder or file permissions are wrong.

```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP

# Check the dist folder exists and has files
ls /home/ubuntu/GradSurveyUI/dist/

# Fix permissions
chmod 755 /home/ubuntu
chmod -R 755 /home/ubuntu/GradSurveyUI/dist/

# Check Nginx config
sudo nginx -t
sudo systemctl reload nginx
```

If `dist/` is empty or missing, the frontend was not built. Run:
```bash
cd /home/ubuntu/GradSurveyUI && npm run build && chmod -R 755 dist/
```

---

### App shows "502 Bad Gateway"

**Cause:** Nginx is running but the FastAPI backend is not responding.

```bash
# Check if the backend service is running
sudo systemctl status gradsurvey

# If failed, check why
sudo journalctl -u gradsurvey -n 50 --no-pager

# Restart it
sudo systemctl restart gradsurvey
```

Common causes of backend failure:
- Missing Python package → `pip install -r requirements.txt`
- Bad `.env` file / wrong database credentials → check the `.env`
- Port 8000 already in use → `sudo lsof -ti :8000 | xargs kill -9 && sudo systemctl restart gradsurvey`

---

### App shows "500 Internal Server Error"

**Cause:** Backend is running but crashing on a specific request.

```bash
# Watch logs while reproducing the error in the browser
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP \
  "sudo journalctl -u gradsurvey -f"
```

Open the app in the browser and trigger the error — the log will show the Python traceback.

---

### Cannot SSH into the server (Connection timed out)

Work through this checklist:

1. **Is the instance running?**
   EC2 → Instances → check Instance state = Running

2. **Is port 22 open in the security group?**
   EC2 → Security Groups → Inbound rules → must have SSH, port 22, 0.0.0.0/0

3. **Are you using the right IP?**
   EC2 → Instances → check Public IPv4 address matches what you're connecting to

4. **Is the subnet public?**
   The instance must be in `prod-sharedvpc1-dept-public1` or `public2`. Private subnets block SSH.

5. **Is the key file correct?**
   ```bash
   chmod 400 ~/Desktop/gradsurvey-key.pem
   ssh -i ~/Desktop/gradsurvey-key.pem -v ubuntu@YOUR_EC2_IP 2>&1 | head -20
   ```

6. **Try rebooting the instance**
   EC2 → Instances → Instance state → Reboot

---

### Data not showing / API returning errors

```bash
# Check backend is running
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP \
  "sudo systemctl status gradsurvey --no-pager"

# Test the API directly
curl http://YOUR_EC2_IP/api/filters/terms

# Check backend logs for database errors
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP \
  "sudo journalctl -u gradsurvey -n 100 --no-pager | grep -i error"
```

If you see `connection refused` or `could not connect to server`, the database credentials in `.env` may be wrong or the database server is unreachable.

---

### Frontend shows old version after redeployment

Browser caching. Try:
- **Mac Chrome/Safari:** `Cmd+Shift+R`
- **Windows:** `Ctrl+Shift+R`
- Open in a private/incognito window

If still showing old version, confirm the build actually ran:
```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP \
  "ls -la /home/ubuntu/GradSurveyUI/dist/assets/ | tail -5"
```
The timestamps should match when you deployed.

---

### Server is unresponsive / very slow

Check memory and CPU:
```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP \
  "free -h && echo '---' && top -b -n1 | head -15"
```

If memory is full (used > 90%), restart the backend:
```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP \
  "sudo systemctl restart gradsurvey"
```

If still unresponsive, reboot from the AWS console:
EC2 → Instances → GradSurvey → Instance state → **Reboot**

---

### Nginx config changes not taking effect

```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP

# Test config for syntax errors first
sudo nginx -t

# Reload (apply config changes without restarting)
sudo systemctl reload nginx

# If reload fails, full restart
sudo systemctl restart nginx
```

---

### Build fails with TypeScript errors

Common fix — these changes must be applied every time on a fresh server:
```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@YOUR_EC2_IP
cd /home/ubuntu/GradSurveyUI

sed -i 's/"noUnusedLocals": true/"noUnusedLocals": false/' tsconfig.app.json
sed -i 's/"noUnusedParameters": true/"noUnusedParameters": false/' tsconfig.app.json
sed -i 's/exportData.records as MasterRecord\[\]/exportData.records as unknown as MasterRecord[]/g' src/pages/DownloadPage.tsx
sed -i 's|http://localhost:8000/api|/api|g' src/api.ts

npm run build
```

---

## 15. UMD-Specific AWS Notes

### VPC structure
UMD's AWS environment uses a shared VPC (`prod-sharedvpc1-dept-vpc`, CIDR `10.14.0.0/16`). This VPC has:

| Subnet | Type | Can reach internet? |
|--------|------|---------------------|
| prod-sharedvpc1-dept-public1 | Public | Yes — use this |
| prod-sharedvpc1-dept-public2 | Public | Yes — use this |
| prod-sharedvpc1-dept-private1 | Private | No |
| prod-sharedvpc1-dept-private2 | Private | No |

**Always use a public subnet.** Private subnets route through the university VPN and cannot be reached from the public internet.

### No default VPC
Unlike standard AWS accounts, the UMD account does not have a default VPC. Always explicitly select `prod-sharedvpc1-dept-vpc` when launching instances.

### Network ACLs
The VPC has Network ACLs (stateless firewall rules at the subnet level) managed by UMD IT. If you open a port in your Security Group but traffic is still blocked, a Network ACL may be blocking it. Contact Sharon or UMD IT Support.

### IAM permissions
Your IAM user may have restricted permissions. If you get "Access Denied" errors when trying to create resources, contact Sharon to have the necessary permissions added.

### Region
Use **US East (Ohio) — us-east-2** or **US East (N. Virginia) — us-east-1**. The existing instance is in us-east-1.

---

## 16. Current Deployment Reference

| Item | Value |
|------|-------|
| **App URL** | http://3.81.38.238 |
| **EC2 Instance name** | GradSurvey |
| **Instance ID** | i-030f9e53ced6d541 |
| **Instance type** | t3.small |
| **Region** | US East (N. Virginia) — us-east-1 |
| **Availability Zone** | us-east-1d |
| **Operating system** | Ubuntu 22.04 LTS |
| **Public IP (Elastic)** | 3.81.38.238 |
| **VPC** | prod-sharedvpc1-dept-vpc |
| **Subnet** | prod-sharedvpc1-dept-public2 |
| **Security group** | launch-wizard-2 |
| **SSH key pair** | gradsurvey-key |
| **SSH key file** | gradsurvey-key.pem (keep on Desktop) |
| **Server username** | ubuntu |
| **Project directory** | /home/ubuntu/GradSurveyUI |
| **Backend service** | gradsurvey (systemd) |
| **Backend port** | 8000 (localhost only, not public) |
| **Web server** | Nginx (port 80) |
| **SSL/HTTPS** | Not configured |
| **Database** | External PostgreSQL (credentials in .env) |

### File locations on the server

| File/Folder | Path |
|-------------|------|
| Project root | `/home/ubuntu/GradSurveyUI/` |
| Frontend build | `/home/ubuntu/GradSurveyUI/dist/` |
| Backend code | `/home/ubuntu/GradSurveyUI/backend/` |
| Python venv | `/home/ubuntu/GradSurveyUI/backend/venv/` |
| Environment variables | `/home/ubuntu/GradSurveyUI/backend/.env` |
| systemd service file | `/etc/systemd/system/gradsurvey.service` |
| Nginx config | `/etc/nginx/sites-available/gradsurvey` |
| Nginx access log | `/var/log/nginx/access.log` |
| Nginx error log | `/var/log/nginx/error.log` |

---

## 17. API Reference

All API endpoints are prefixed with `/api`. In production these are accessed through Nginx at `http://YOUR_EC2_IP/api/...`

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | List students with optional filters |
| GET | `/api/students/{uid}` | Get a single student by UID |
| POST | `/api/students/{uid}/master` | Save/update master record |
| DELETE | `/api/students/{uid}/master` | Delete master record |

Query parameters for `/api/students`:
- `name` — filter by name
- `major` — filter by major code
- `school` — filter by school code
- `term` — filter by graduation term (e.g., `202508`)
- `uid` — filter by student UID
- `sources` — filter by data source (`qualtrics`, `linkedin`, `clearinghouse`)
- `limit` — number of results (default 20)
- `offset` — pagination offset

### Filters

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/filters/majors` | List all available majors |
| GET | `/api/filters/schools` | List all available schools |
| GET | `/api/filters/terms` | List all graduation terms |

### Reports & Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/report/data` | Get aggregated report JSON |
| GET | `/api/report/download` | Download DOCX report file |
| GET | `/api/export` | Get records for CSV export |

Query parameters for report/export:
- `major` — filter by major
- `school` — filter by school
- `term` — filter by term

### Health check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Returns `{"message": "Graduate Outcomes API"}` |

---

## 18. Contacts & Support

| Who | Role | When to contact |
|-----|------|-----------------|
| **Sharon** | AWS access manager | Need AWS access, IAM permissions, network issues |
| **UMD IT Support** | IT help desk | General AWS issues, VPN, authentication |
| **Previous maintainer** | App developer | `.env` file, database credentials, codebase questions |

**UMD IT Support:** [https://itsupport.umd.edu](https://itsupport.umd.edu)

**AWS Access KB Article:** [https://itsupport.umd.edu/itsupport?id=kb_article_view&sysparm_article=KB0016087](https://itsupport.umd.edu/itsupport?id=kb_article_view&sysparm_article=KB0016087&sys_kb_id=1557af4f1bb9415009f28734ec4bcbd0&spa=1)
