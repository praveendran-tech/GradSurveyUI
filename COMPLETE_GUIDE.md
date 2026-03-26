# Graduate Survey UI — Complete Guide
### Starting the Application Locally & Deploying to AWS

**Written for non-technical staff. No prior programming or cloud experience required.**

---

## Before You Start: Who Is This Guide For?

This guide is for anyone who needs to run or deploy the Graduate Survey application — even if you have never used a command line, never set up a server, and have never heard of AWS. Every step is explained in plain English, every command is copy-pasteable, and every technical term is explained when it first appears.

If you get stuck at any point, the last section of this guide lists who to contact.

---

## Table of Contents

1. [What Is This Application?](#1-what-is-this-application)
2. [Key Concepts Explained Simply](#2-key-concepts-explained-simply)
3. [Getting the Code onto Your Computer](#3-getting-the-code-onto-your-computer)
   - [Installing Git](#31-installing-git)
   - [Installing Visual Studio Code (VSCode)](#32-installing-visual-studio-code-vscode)
   - [Cloning the Repository (Downloading the Code)](#33-cloning-the-repository-downloading-the-code)
   - [Opening the Project in VSCode](#34-opening-the-project-in-vscode)
4. [Running the App on Your Own Computer (Local)](#4-running-the-app-on-your-own-computer-local)
   - [What You Need First](#41-what-you-need-first)
   - [Opening a Terminal](#42-opening-a-terminal)
   - [Starting the Backend (the data engine)](#43-starting-the-backend-the-data-engine)
   - [Starting the Frontend (the visual interface)](#44-starting-the-frontend-the-visual-interface)
   - [Stopping the App](#45-stopping-the-app)
5. [Deploying to AWS (Publishing to the Internet)](#5-deploying-to-aws-publishing-to-the-internet)
   - [Getting AWS Access](#51-getting-aws-access)
   - [Creating a Cloud Server (EC2)](#52-creating-a-cloud-server-ec2)
   - [Giving Your Server a Permanent Address](#53-giving-your-server-a-permanent-address)
   - [Opening the Firewall](#54-opening-the-firewall)
   - [Connecting to Your Server](#55-connecting-to-your-server)
   - [Installing Required Software on the Server](#56-installing-required-software-on-the-server)
   - [Uploading the Application Files](#57-uploading-the-application-files)
   - [Configuring the Database Connection](#58-configuring-the-database-connection)
   - [Installing Python Dependencies](#59-installing-python-dependencies)
   - [Building the Frontend](#510-building-the-frontend)
   - [Setting Up Auto-Start (systemd Service)](#511-setting-up-auto-start-systemd-service)
   - [Configuring the Web Server (Nginx)](#512-configuring-the-web-server-nginx)
   - [Testing That Everything Works](#513-testing-that-everything-works)
6. [Updating the Application After Code Changes](#6-updating-the-application-after-code-changes)
7. [Day-to-Day Server Management](#7-day-to-day-server-management)
8. [Monitoring & Viewing Logs](#8-monitoring--viewing-logs)
9. [Troubleshooting Common Problems](#9-troubleshooting-common-problems)
10. [Cost Management on AWS](#10-cost-management-on-aws)
11. [Security Best Practices](#11-security-best-practices)
12. [Contacts & Who to Ask for Help](#12-contacts--who-to-ask-for-help)

---

> **Completely new to all of this?** Start at Section 3. It walks you through downloading the code, installing all the tools you need, and getting the application open on your screen — from absolute scratch.

---

## 1. What Is This Application?

The **Graduate Survey UI** is an internal web tool for University of Maryland staff. It collects and displays graduate student outcomes from three data sources:

- **Qualtrics** — survey responses filled out by graduates
- **LinkedIn** — employment data
- **National Student Clearinghouse** — further education records

Staff use this tool to review each student's records, reconcile data across sources, generate reports by major, and export data to spreadsheets.

### How It Is Built (the simple version)

Think of the application as two separate programs that work together:

| Part | What It Does | Analogy |
|------|-------------|---------|
| **Frontend** (React app) | The visual interface you see in the browser — buttons, tables, filters | The dashboard of a car |
| **Backend** (FastAPI) | The data engine that reads/writes to the database | The engine under the hood |
| **Database** (PostgreSQL) | Where all the student data lives | The fuel tank |
| **Nginx** | A traffic director that routes browser requests to the right place | A receptionist |

When a user opens the app in their browser:
1. The browser loads the visual interface from the server
2. The interface asks the backend for data (e.g., "give me all students for Spring 2024")
3. The backend queries the database
4. The data comes back and gets displayed on screen

---

## 2. Key Concepts Explained Simply

Before following the steps, here are a few terms you will encounter:

### Terminal / Command Line
A text-based window where you type commands. Think of it as texting your computer with very specific instructions. On Mac it is called **Terminal**; on Windows it is called **Command Prompt** or **PowerShell**.

### npm (Node Package Manager)
A tool that downloads and manages all the JavaScript libraries the frontend needs. It is like an app store for code building blocks.

### pip
The same idea as npm, but for Python. It installs libraries that the backend needs.

### Virtual Environment (venv)
An isolated container for Python packages. Imagine a separate tool belt just for this project — packages installed here do not interfere with anything else on the computer.

### AWS (Amazon Web Services)
Amazon's cloud computing platform. Instead of buying a physical server, you rent virtual computers by the hour. This is where the application runs so anyone can access it via the internet.

### EC2 (Elastic Compute Cloud)
The AWS service that gives you a virtual computer (called an "instance") in the cloud. Think of it as renting a computer that lives in Amazon's data center.

### Elastic IP
A permanent, fixed internet address for your server. Without it, the server gets a new address every time it restarts, which would break any bookmarked links.

### Security Group
AWS's firewall. It controls which types of network traffic are allowed in and out of your server.

### SSH (Secure Shell)
A secure way to remotely control your server from your own computer by typing commands. It uses an encryption key file (`.pem`) instead of a password.

### Nginx
A web server software that runs on the EC2 instance. It handles incoming browser requests and routes them — either serving the frontend files directly, or forwarding `/api/` requests to the Python backend.

### systemd Service
A way to register the backend Python app as an official system service so that it starts automatically when the server boots and restarts itself if it ever crashes.

---

## 3. Getting the Code onto Your Computer

Before you can run anything, you need to download the code from GitHub (an online code storage service) onto your own computer. Think of GitHub like Google Drive, but specifically for code.

The project URL is: **https://github.com/praveendran-tech/GradSurveyUI**

---

### 3.1 Installing Git

**Git** is a free tool that lets you download ("clone") code from GitHub to your computer.

**On Mac:**

1. Open Terminal (press `Command + Space`, type `Terminal`, press Enter)
2. Type this command and press Enter:
   ```bash
   git --version
   ```
3. If Git is already installed, you will see something like `git version 2.39.0`. Skip to Section 3.2.
4. If it is NOT installed, macOS will automatically show a popup asking to install developer tools. Click **Install** and wait for it to finish (takes 5–10 minutes).

**On Windows:**

1. Go to [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. The download starts automatically. Run the installer.
3. Click **Next** on every screen — the default options are fine.
4. When finished, you will have a program called **"Git Bash"** installed. This is a special terminal you will use for all commands in this guide.

---

### 3.2 Installing Visual Studio Code (VSCode)

**Visual Studio Code** (VSCode) is a free program for viewing and editing code. Even if you never plan to write code, it is the easiest way to open and explore this project.

1. Go to [https://code.visualstudio.com](https://code.visualstudio.com)
2. Click the big blue **"Download"** button (it auto-detects your operating system)
3. Run the downloaded installer
4. Follow the on-screen steps. When you reach "Select Additional Tasks", check all the boxes (especially "Add to PATH" and "Open with Code").
5. Click **Install**, then **Finish**

VSCode is now installed.

---

### 3.3 Cloning the Repository (Downloading the Code)

"Cloning" means downloading a full copy of the project code from GitHub to your computer. You only need to do this once.

**Step 1 — Open a Terminal:**
- **Mac:** Press `Command + Space`, type `Terminal`, press Enter
- **Windows:** Open **Git Bash** (search for it in the Start menu — it was installed with Git in step 3.1)

**Step 2 — Navigate to your Desktop:**
- **Mac:**
  ```bash
  cd ~/Desktop
  ```
- **Windows:**
  ```bash
  cd ~/Desktop
  ```

**Step 3 — Clone the repository:**

Type this command and press Enter:
```bash
git clone https://github.com/praveendran-tech/GradSurveyUI.git
```

You will see output like:
```
Cloning into 'GradSurveyUI'...
remote: Enumerating objects: 847, done.
remote: Counting objects: 100% (847/847), done.
Receiving objects: 100% (847/847), 2.34 MiB | 5.00 MiB/s, done.
```

When it finishes, a new folder called `GradSurveyUI` will appear on your Desktop. This is the full application code.

> **Note:** If you get a "repository not found" error, the repository may be private. You will need to ask the developer to give your GitHub account access, or to share the code another way.

---

### 3.4 Opening the Project in VSCode

**Method 1 — Drag and drop (easiest):**
1. Open VSCode
2. Open your Desktop folder in Finder (Mac) or File Explorer (Windows)
3. Drag the `GradSurveyUI` folder onto the VSCode window

**Method 2 — From the terminal:**
```bash
code ~/Desktop/GradSurveyUI
```
*(If `code` is not recognized on Mac, open VSCode → press `Command+Shift+P` → type "Shell Command: Install 'code' command in PATH" → click it → try again)*

**Method 3 — From VSCode menu:**
1. Open VSCode
2. Click **File** → **Open Folder**
3. Navigate to your Desktop → select the `GradSurveyUI` folder → click **Open**

Once the project is open, you will see the file tree on the left side of VSCode. You can browse through all the files, but you do not need to understand or modify any of them to run the application.

**Recommended VSCode Extension:**

In VSCode, click the Extensions icon on the left sidebar (it looks like four squares). Search for and install:
- **"Python"** by Microsoft — helps with the backend
- **"ES7+ React/Redux"** — helps with the frontend

These are optional but make the code easier to read if you ever need to look at it.

---

## 4. Running the App on Your Own Computer (Local)

Running the app locally is useful for development and testing. It runs entirely on your machine — no cloud required.

### 4.1 What You Need First

Before you can run the app, you need these things installed on your computer:

#### Node.js (required for the frontend)

1. Go to [https://nodejs.org](https://nodejs.org)
2. Click the big green button that says **"LTS"** (Long Term Support)
3. Download and run the installer
4. Follow the on-screen instructions (just click Next/Continue throughout)
5. When done, open Terminal (Mac) or Command Prompt (Windows) and type:
   ```
   node --version
   ```
   You should see something like `v22.0.0`. If you do, Node.js is installed.

#### Python 3 (required for the backend)

1. Go to [https://www.python.org/downloads/](https://www.python.org/downloads/)
2. Click the big yellow **"Download Python 3.x.x"** button
3. Run the installer
4. **Important on Windows:** Check the box that says **"Add Python to PATH"** before clicking Install
5. When done, open a new Terminal/Command Prompt window and type:
   ```
   python3 --version
   ```
   You should see `Python 3.x.x`.

#### The project files

If you completed Section 3, the code is already on your Desktop in a folder called `GradSurveyUI`. If you have not done that yet, go back to Section 3 and follow those steps first.

#### The `.env` file

The backend needs a file called `.env` that contains the database password. **This file is never stored in the shared codebase for security reasons.** You must get it from Sharon or the previous maintainer.

Once you have it, place it at:
```
GradSurveyUI/
  backend/
    .env        ← put it here
```

The file should look like this (the actual values will be filled in):
```
DB_HOST=grad-outcomes-db.chc8eewosgc5.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=grad_outcomes_db
DB_USER=postgres
DB_PASSWORD=your_actual_password_here
```

---

### 4.2 Opening a Terminal

**On Mac:**
1. Press `Command + Space` to open Spotlight Search
2. Type `Terminal` and press Enter
3. A black or white text window opens — this is your terminal

**On Windows:**
1. Press the Windows key
2. Type `PowerShell` or `Command Prompt`
3. Click to open it

**Navigating to the project folder:**

Once your terminal is open, you need to navigate to the `GradSurveyUI` folder. Type the `cd` command (which stands for "change directory") followed by the path to the folder.

For example, if the folder is on your Desktop:
- **Mac:** `cd ~/Desktop/GradSurveyUI`
- **Windows:** `cd C:\Users\YourName\Desktop\GradSurveyUI`

Press Enter after typing the command. The terminal prompt will update to show you are now inside that folder.

> **Tip:** You can also drag the folder from Finder/File Explorer into the terminal window after typing `cd ` (with a space) — it will automatically fill in the path.

---

### 4.3 Starting the Backend (the data engine)

The backend must be started **before** the frontend, because the frontend needs it to load data.

You will need **two separate terminal windows** running at the same time. Open a second terminal now.

In the **first terminal window**, run these commands one by one. Press Enter after each one and wait for it to finish before typing the next:

**Step 1 — Navigate to the backend folder:**
```bash
cd ~/Desktop/GradSurveyUI/backend
```
*(On Windows, use `cd C:\Users\YourName\Desktop\GradSurveyUI\backend`)*

**Step 2 — Create a Python virtual environment** (only needed once, the very first time):
```bash
python3 -m venv venv
```
This creates a folder called `venv` inside the backend folder. It is a self-contained Python environment for this project. This takes about 30 seconds.

**Step 3 — Activate the virtual environment:**

- **Mac/Linux:**
  ```bash
  source venv/bin/activate
  ```
- **Windows:**
  ```bash
  venv\Scripts\activate
  ```

After running this, you will notice the terminal prompt now starts with `(venv)`. This means the virtual environment is active. All Python commands now use this isolated environment.

**Step 4 — Install Python dependencies** (only needed once, or when requirements change):
```bash
pip install -r requirements.txt
```
This downloads all the Python libraries the backend needs. It may take a few minutes. You will see a long list of items being installed.

**Step 5 — Start the backend server:**
```bash
python main.py
```

If everything works, you will see output like:
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

The backend is now running. **Do not close this terminal window.** Leave it running in the background.

> **To verify the backend is working:** Open your browser and go to `http://localhost:8000/docs`. You should see an interactive API documentation page.

---

### 4.4 Starting the Frontend (the visual interface)

In your **second terminal window**:

**Step 1 — Navigate to the main project folder:**
```bash
cd ~/Desktop/GradSurveyUI
```

**Step 2 — Install JavaScript dependencies** (only needed once, or when dependencies change):
```bash
npm install
```
This downloads all the JavaScript libraries needed. You will see a progress bar. It may take 1–2 minutes the first time.

**Step 3 — Start the frontend development server:**
```bash
npm run dev
```

You will see output like:
```
  VITE v7.3.1  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Step 4 — Open the app in your browser:**

Go to: **http://localhost:5173**

The application will open. You should see the UMD Graduate Survey landing page.

> **Note:** This "development" version is only accessible on your own computer. No one else can access it. It is for your own testing only.

---

### 4.5 Stopping the App

To stop the app, go to each terminal window and press **`Ctrl + C`** (hold the Control key and press C). This stops the server running in that window.

To deactivate the Python virtual environment, type:
```bash
deactivate
```

---

## 5. Deploying to AWS (Publishing to the Internet)

Deploying means putting the application on a cloud server so that anyone with the right link can access it from any computer, anywhere.

> **Time estimate:** 45–60 minutes for a first-time deployment.

---

### 5.1 Getting AWS Access

This application runs on the University of Maryland's AWS environment.

**To request access:**
1. Follow the UMD IT instructions here: [https://itsupport.umd.edu/itsupport?id=kb_article_view&sysparm_article=KB0016087](https://itsupport.umd.edu/itsupport?id=kb_article_view&sysparm_article=KB0016087)
2. If the link does not work or you are unsure what to request, **contact Sharon** — she manages AWS access for the department.

**To log in to AWS:**
1. Go to [https://console.aws.amazon.com](https://console.aws.amazon.com)
2. Log in with your UMD credentials
3. You should land on the AWS Console home page, which shows various services

> **Important:** UMD's AWS account uses a shared university network. When setting up your server, you must always choose a **"public"** subnet (not a "private" one). This is explained in detail in the steps below.

---

### 5.2 Creating a Cloud Server (EC2)

Think of this step as renting a virtual computer from Amazon. This computer will run the application 24/7.

**Step 1 — Find the EC2 service:**
1. In the AWS Console, look for the search bar at the top
2. Type `EC2` and click on **EC2** in the results
3. You are now on the EC2 Dashboard

**Step 2 — Set the correct region:**

Look at the very top-right corner of the screen. You will see a region name like "N. Virginia" or "Ohio". The application should be in **US East (N. Virginia)** or **US East (Ohio)**.

If it shows a different region, click the region name and select the correct one from the dropdown.

**Step 3 — Launch a new instance:**
1. Click the orange **"Launch Instance"** button
2. A multi-step form will appear

**Step 4 — Fill in the server settings:**

Fill in each section as follows:

**Name:**
| Field | What to enter |
|-------|--------------|
| Name | `GradSurvey` |

**Operating System (AMI):**

The AMI is the operating system your server will run.
1. In the "Application and OS Images" section, click **"Browse more AMIs"** if needed
2. Search for **"Ubuntu 22.04"**
3. Select **"Ubuntu Server 22.04 LTS (HVM), SSD Volume Type"**

> Look for "Free tier eligible" below the name — that indicates the base OS has no extra charge.

**Server Size (Instance type):**
| Field | What to enter |
|-------|--------------|
| Instance type | `t3.small` |

Search for `t3.small` in the dropdown. This gives you 2 virtual CPUs and 2 GB of memory, which is enough for this application.

> Do NOT choose `t3.micro` — it only has 1 GB of memory and may run out when building the app.

**Key Pair (your server password):**

A key pair is like a digital key to your server. Without it, you cannot connect to manage it.

1. Click **"Create new key pair"**
2. Fill in:
   | Field | What to enter |
   |-------|--------------|
   | Key pair name | `gradsurvey-key` |
   | Key pair type | RSA |
   | Private key file format | `.pem` |
3. Click **"Create key pair"**
4. A file called `gradsurvey-key.pem` will automatically download to your Downloads folder

> **This is critically important:** Move this `.pem` file to a safe location immediately (not just Downloads). Store a copy in the department's secure shared drive or password manager. **If you lose this file, you will permanently lose access to the server and will have to create a new one from scratch.**

**Network Settings:**

This is where you configure which network your server lives on. You MUST use UMD's network settings here.

1. Click **"Edit"** next to Network settings
2. Fill in:
   | Field | What to enter |
   |-------|--------------|
   | VPC | `prod-sharedvpc1-dept-vpc` |
   | Subnet | `prod-sharedvpc1-dept-public1` OR `prod-sharedvpc1-dept-public2` |
   | Auto-assign public IP | **Enable** (toggle it on) |

> **Critical:** The subnet name MUST contain the word **"public"**. If you choose a subnet with "private" in the name, the server will have no internet access and the application will be unreachable. Look carefully at the subnet name before selecting it.

**Firewall (Security Group):**

A security group is a list of rules that controls who can connect to your server. Select **"Create security group"** and add these two rules:

| Type | Port | Who can access |
|------|------|---------------|
| SSH | 22 | Anywhere (0.0.0.0/0) |
| HTTP | 80 | Anywhere (0.0.0.0/0) |

SSH (port 22) lets you log in to manage the server. HTTP (port 80) lets users access the web application.

To add a rule: click **"Add security group rule"** and set the Type, then the Source to "Anywhere".

**Storage:**

Change the storage from the default 8 GB to 20 GB:
| Field | What to enter |
|-------|--------------|
| Size (GiB) | `20` |
| Volume type | `gp3` |

**Step 5 — Launch the instance:**
1. Click **"Launch Instance"** (orange button on the right)
2. Click **"View all instances"**
3. Wait 1–2 minutes for the Status to change from "Initializing" to **"Running"** and for the Status Checks column to show **"2/2 checks passed"**

---

### 5.3 Giving Your Server a Permanent Address

Right now, your server has a temporary internet address that changes every time it restarts. An **Elastic IP** gives it a permanent, fixed address — like having a permanent home address instead of a hotel room number that changes each night.

**Steps:**

1. In the EC2 left sidebar, scroll down to **"Network & Security"** → click **"Elastic IPs"**
2. Click **"Allocate Elastic IP address"**
3. Leave all settings as-is → click **"Allocate"**
4. A new IP address appears (e.g., `3.81.38.238`) — **write this number down**. This is your server's permanent address.
5. Check the checkbox next to the new IP
6. Click **"Actions"** → **"Associate Elastic IP address"**
7. Under "Instance", click the dropdown and select `GradSurvey`
8. Click **"Associate"**

Your server now has a fixed address. Any time someone types this IP into their browser, they will reach the application (once it's fully set up).

> **Cost note:** Elastic IPs are free while your server is running. If you ever stop or delete the server, release the Elastic IP from the EC2 console to avoid a small (~$0.005/hour) charge.

---

### 5.4 Opening the Firewall

Verify that your firewall rules were created correctly:

1. In EC2 → Instances → click on `GradSurvey`
2. Click the **"Security"** tab at the bottom
3. Click the security group link (looks like `sg-abc123456`)
4. Click **"Inbound rules"** tab
5. You should see rules for port 22 and port 80

If either is missing:
1. Click **"Edit inbound rules"**
2. Click **"Add rule"**
3. Add the missing port (SSH/22 or HTTP/80) with Source = "Anywhere"
4. Click **"Save rules"**

---

### 5.5 Connecting to Your Server

You will now log into your cloud server remotely using SSH. This is like remote-controlling the server from your own computer via text commands.

**On Mac:**

1. Open your Terminal application
2. Make the key file secure (required by SSH — it won't work otherwise):
   ```bash
   chmod 400 ~/Desktop/gradsurvey-key.pem
   ```
   *(The key file is stored at `~/Desktop/gradsurvey-key.pem`. If you have moved it, update the path.)*

3. Connect to the server:
   ```bash
   ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@3.81.38.238
   ```

4. The first time you connect, you will see a message like:
   ```
   The authenticity of host '3.81.38.238' can't be established.
   Are you sure you want to continue connecting (yes/no)?
   ```
   Type `yes` and press Enter.

5. You are now logged in. Your terminal prompt will change to something like:
   ```
   ubuntu@ip-10-0-1-100:~$
   ```
   This means you are now controlling the cloud server remotely.

**On Windows:**

Windows does not have built-in SSH in older versions. Install **Git for Windows** from [https://git-scm.com](https://git-scm.com), which includes a terminal. Then follow the same steps as Mac above, but open "Git Bash" instead of Terminal.

Alternatively, you can use **PuTTY** (a free Windows SSH client). The PuTTY setup process is different — search "how to use PuTTY with a .pem file" for instructions if needed.

---

### 5.6 Installing Required Software on the Server

Your new server is a bare Ubuntu Linux machine. You need to install Node.js, Python, and Nginx on it.

While still connected to the server via SSH, run these commands. Copy and paste each block, then wait for it to finish before running the next.

**Update the server's software list:**
```bash
sudo apt update && sudo apt upgrade -y
```
This may take 2–3 minutes. The `sudo` prefix means "run as administrator". The `-y` flag automatically answers "yes" to any prompts.

**Install Node.js 20:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

**Verify Node.js installed:**
```bash
node --version
```
You should see `v20.x.x`.

**Install Python and pip:**
```bash
sudo apt install -y python3 python3-pip python3-venv
```

**Install Nginx (the web server):**
```bash
sudo apt install -y nginx
```

**Verify Nginx is running:**
```bash
sudo systemctl status nginx
```
You should see `Active: active (running)` in green. Press `q` to exit.

---

### 5.7 Uploading the Application Files

You need to copy the application code from your local computer to the server.

> **Important:** Run the commands in this section from your **local computer's terminal**, NOT from the SSH session. Open a new terminal window or tab for this.

**On Mac:**

Run this command from your local terminal (replace `3.81.38.238`):
```bash
rsync -avz --exclude='node_modules' --exclude='dist' --exclude='backend/venv' \
  -e "ssh -i ~/Desktop/gradsurvey-key.pem" \
  ~/Desktop/GradSurveyUI/ \
  ubuntu@3.81.38.238:/home/ubuntu/GradSurveyUI/
```

This copies the entire project folder to the server, but skips the large `node_modules`, `dist`, and `venv` folders (these will be generated on the server itself). The upload may take 1–2 minutes depending on your internet speed.

**On Windows (Git Bash):**
```bash
rsync -avz --exclude='node_modules' --exclude='dist' --exclude='backend/venv' \
  -e "ssh -i /c/Users/YourName/Downloads/gradsurvey-key.pem" \
  /c/Users/YourName/Desktop/GradSurveyUI/ \
  ubuntu@3.81.38.238:/home/ubuntu/GradSurveyUI/
```

When the command finishes, you should see a summary listing all the files transferred.

---

### 5.8 Configuring the Database Connection

The `.env` file containing the database password was NOT uploaded (it is intentionally excluded from git for security). You need to create it directly on the server.

Switch back to your **SSH terminal window** (the one connected to the server).

Run this command to create the `.env` file. **Replace each value with the actual credentials** — get them from Sharon or the previous maintainer:
```bash
cat > /home/ubuntu/GradSurveyUI/backend/.env << 'EOF'
DB_HOST=grad-outcomes-db.chc8eewosgc5.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=grad_outcomes_db
DB_USER=postgres
DB_PASSWORD=REPLACE_WITH_ACTUAL_PASSWORD
EOF
```

After running it, verify the file was created correctly:
```bash
cat /home/ubuntu/GradSurveyUI/backend/.env
```
You should see all five lines printed back.

> **Security note:** This file contains the database password. Never share its contents in emails, Slack messages, or screenshots.

---

### 5.9 Installing Python Dependencies

Still in your SSH terminal:

**Navigate to the backend folder:**
```bash
cd /home/ubuntu/GradSurveyUI/backend
```

**Create a Python virtual environment:**
```bash
python3 -m venv venv
```

**Activate the virtual environment:**
```bash
source venv/bin/activate
```

Your prompt will now start with `(venv)`.

**Install all Python libraries:**
```bash
pip install -r requirements.txt
```

This installs FastAPI, database drivers, and all other backend dependencies. It will take 1–2 minutes.

**Test the database connection:**
```bash
python3 -c "from database import get_connection; conn = get_connection(); print('Database connection: OK'); conn.close()"
```

If you see `Database connection: OK`, the backend can reach the database.

**Deactivate the virtual environment:**
```bash
deactivate
```

---

### 5.10 Building the Frontend

The frontend must be "compiled" — converted from developer source code into optimized files that browsers can read. This only needs to happen once per code update.

**Navigate to the project root:**
```bash
cd /home/ubuntu/GradSurveyUI
```

**Install JavaScript dependencies:**
```bash
npm install
```

This downloads all the JavaScript libraries. It may take 2–3 minutes.

**Build the production version:**
```bash
npm run build
```

This compiles the React application into a `dist/` folder containing plain HTML, CSS, and JavaScript. You will see a summary of files created when it finishes:
```
dist/index.html                   1.23 kB
dist/assets/index-AbCd1234.js   342.00 kB
dist/assets/index-EfGh5678.css   45.00 kB
✓ built in 15.34s
```

---

### 5.11 Setting Up Auto-Start (systemd Service)

Right now, if you start the backend server and then close the SSH window, the backend will stop. A **systemd service** registers the backend as an official system process that:
- Starts automatically when the server boots
- Restarts automatically if it crashes
- Runs permanently in the background

**Create the service file:**

Run this entire block as one command (copy and paste it all at once):
```bash
sudo tee /etc/systemd/system/gradsurvey.service > /dev/null << 'EOF'
[Unit]
Description=Graduate Survey API Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/GradSurveyUI/backend
EnvironmentFile=/home/ubuntu/GradSurveyUI/backend/.env
ExecStart=/home/ubuntu/GradSurveyUI/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

**Register and start the service:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable gradsurvey
sudo systemctl start gradsurvey
```

**Check that it is running:**
```bash
sudo systemctl status gradsurvey
```

You should see `Active: active (running)` in green. If you see an error instead, see the Troubleshooting section.

---

### 5.12 Configuring the Web Server (Nginx)

Nginx acts as the main entry point for all web traffic. It:
- Serves the frontend files (HTML/CSS/JavaScript) directly
- Forwards any request starting with `/api/` to the Python backend

**Create the Nginx configuration file:**

Run this entire block at once:
```bash
sudo tee /etc/nginx/sites-available/gradsurvey > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    root /home/ubuntu/GradSurveyUI/dist;
    index index.html;

    # Serve static frontend files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Forward API calls to the Python backend
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 300s;
    }
}
EOF
```

**Enable this configuration:**
```bash
sudo ln -s /etc/nginx/sites-available/gradsurvey /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

**Test that the configuration has no errors:**
```bash
sudo nginx -t
```

You should see:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**Restart Nginx to apply changes:**
```bash
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

### 5.13 Testing That Everything Works

**Test 1 — Check the backend is running:**
```bash
curl http://localhost:8000/api/filters/terms
```
You should see a JSON response with term data (e.g., `["Spring 2024", "Fall 2023", ...]`). If you see an error, check the backend service status (Section 6).

**Test 2 — Check Nginx is serving the frontend:**
```bash
curl -I http://localhost:80
```
You should see `HTTP/1.1 200 OK`.

**Test 3 — Open the application in a browser:**

Open a web browser and type your server's Elastic IP address in the address bar:
```
http://3.81.38.238
```

You should see the UMD Graduate Survey landing page with the UMD logo and navigation. If you see it, deployment is complete.

> **If you see a blank page:** The `dist/` folder may not have been built correctly. Re-run `npm run build` from the project root.

> **If you see "502 Bad Gateway":** The backend is not running. Run `sudo systemctl status gradsurvey` to check the error.

> **If the page loads but shows no data:** The database connection may be wrong. Verify the `.env` file contents with `cat /home/ubuntu/GradSurveyUI/backend/.env`.

---

## 6. Updating the Application After Code Changes

When a developer makes changes to the application code, you need to re-upload the files and rebuild. This is much faster than the first-time deployment.

**Step 1 — Upload updated files from your local computer:**

Run this from your **local terminal** (not SSH):
```bash
rsync -avz --exclude='node_modules' --exclude='dist' --exclude='backend/venv' \
  -e "ssh -i ~/Desktop/gradsurvey-key.pem" \
  ~/Desktop/GradSurveyUI/ \
  ubuntu@3.81.38.238:/home/ubuntu/GradSurveyUI/
```

**Step 2 — Connect to the server via SSH:**
```bash
ssh -i ~/Desktop/gradsurvey-key.pem ubuntu@3.81.38.238
```

**Step 3 — Rebuild the frontend:**
```bash
cd /home/ubuntu/GradSurveyUI
npm install
npm run build
```

**Step 4 — Restart the backend (if backend code changed):**
```bash
sudo systemctl restart gradsurvey
```

**Step 5 — Test:**

Open the application in your browser. Refresh with `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) to bypass the browser cache.

The entire update process takes about 3–5 minutes.

---

## 7. Day-to-Day Server Management

Once deployed, you rarely need to do anything. But here are commands for common situations:

### Starting and stopping the backend service

```bash
# Check if the backend is running
sudo systemctl status gradsurvey

# Stop the backend
sudo systemctl stop gradsurvey

# Start the backend
sudo systemctl start gradsurvey

# Restart the backend (use this after code updates)
sudo systemctl restart gradsurvey
```

### Starting and stopping Nginx

```bash
# Check Nginx status
sudo systemctl status nginx

# Restart Nginx (use this after configuration changes)
sudo systemctl restart nginx
```

### Rebooting the server

If the server ever becomes unresponsive, you can reboot it:

**Option A — From the SSH terminal:**
```bash
sudo reboot
```

**Option B — From the AWS Console:**
1. Go to EC2 → Instances
2. Select `GradSurvey`
3. Click **"Instance state"** → **"Reboot instance"**

After a reboot (takes about 1–2 minutes), both the backend and Nginx start automatically thanks to the systemd service configuration.

### Stopping the server to save money

If the application is not needed for a period of time (e.g., summer break), you can stop the EC2 instance to avoid charges. The server stops running but all files are preserved.

**From the AWS Console:**
1. EC2 → Instances → select `GradSurvey`
2. Click **"Instance state"** → **"Stop instance"**
3. Click **"Stop"**

To start it again: Click **"Instance state"** → **"Start instance"**.

> **Note:** After starting again, the Elastic IP will still be associated, so the same address works. Both Nginx and the backend will start automatically.

---

## 8. Monitoring & Viewing Logs

If something is not working, logs are the first place to look. A log is a running diary of what the application is doing.

### Backend application logs

```bash
# View the last 50 lines of backend logs
sudo journalctl -u gradsurvey -n 50

# Watch logs in real time (press Ctrl+C to stop)
sudo journalctl -u gradsurvey -f

# View logs from today only
sudo journalctl -u gradsurvey --since today
```

What to look for in logs:
- `Application startup complete` → backend started successfully
- `INFO: POST /api/...` → a user made a request
- `ERROR` or `CRITICAL` → something went wrong, the following line explains what

### Nginx web server logs

```bash
# View recent errors
sudo tail -50 /var/log/nginx/error.log

# Watch incoming requests in real time
sudo tail -f /var/log/nginx/access.log
```

### Server resource usage

```bash
# See CPU and memory usage (press q to exit)
htop
```

If `htop` is not installed: `sudo apt install -y htop`

### Checking disk space

```bash
df -h
```

Look at the `/` row. The "Use%" column shows how full the disk is. If it exceeds 85%, clean up old files or increase disk size.

---

## 9. Troubleshooting Common Problems

### "I can't reach the server at all"

1. Check that the EC2 instance is running: EC2 → Instances → Instance State = "Running"
2. Check the Elastic IP is still associated: EC2 → Elastic IPs
3. Verify firewall allows port 80: EC2 → Security Groups → Inbound rules
4. Try pinging the IP from your terminal: `ping 3.81.38.238`

### "The page loads but shows no student data"

The backend is running but cannot connect to the database.

1. Check the backend logs: `sudo journalctl -u gradsurvey -n 50`
2. Verify the `.env` file: `cat /home/ubuntu/GradSurveyUI/backend/.env`
3. Make sure the database host, name, user, and password are all correct

### "502 Bad Gateway"

Nginx is running but the backend Python server is not.

1. Check backend status: `sudo systemctl status gradsurvey`
2. Look at logs: `sudo journalctl -u gradsurvey -n 30`
3. Try restarting: `sudo systemctl restart gradsurvey`

### "The page looks broken (no styling, white screen)"

The frontend was not built, or the `dist/` folder is missing.

1. SSH into the server
2. Check if dist exists: `ls /home/ubuntu/GradSurveyUI/dist`
3. If it is empty or missing: `cd /home/ubuntu/GradSurveyUI && npm run build`
4. Restart Nginx: `sudo systemctl restart nginx`

### "SSH connection refused"

1. Check that port 22 is open in the Security Group
2. Verify the instance is running (not stopped)
3. Make sure you are using the correct `.pem` file and IP address
4. Run `chmod 400 ~/Desktop/gradsurvey-key.pem` on Mac/Linux if you get a "permissions" error

### "npm install fails with out-of-memory error"

The server is running out of RAM during the build. Add a swap file (virtual memory):

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

Then retry `npm install`.

### "I accidentally deleted the .env file"

Re-create it using the command in Section 4.8. You need the database credentials — contact Sharon.

---

## 10. Cost Management on AWS

AWS charges by usage. Here is what this application costs and how to keep costs low.

### What you are paying for

| Resource | Cost (approximate) |
|----------|--------------------|
| EC2 `t3.small` running 24/7 | ~$15–20 per month |
| 20 GB storage (EBS) | ~$1.60 per month |
| Elastic IP (while running) | Free |
| Data transfer | ~$0–5 per month |
| **Total** | **~$17–25 per month** |

### How to reduce costs

**Stop the server when not in use:**
If the application is only needed during the academic year, stop the EC2 instance during breaks. You still pay for storage (~$1.60/month) but not for compute time.

**Set up a budget alert:**
1. In the AWS Console, search for **"Billing"**
2. Click **"Budgets"** → **"Create budget"**
3. Set a monthly budget of $50 and an email alert at 80% usage

This ensures you get an email warning before any unexpectedly high charges.

**Check the Cost Explorer:**
1. AWS Console → search **"Cost Explorer"**
2. This shows a breakdown of exactly what you are being charged for each day

---

## 11. Security Best Practices

### Protect the `.pem` key file
- Store it in a secure location (not just your Downloads folder)
- Keep a backup copy in the department's secure storage
- Never share it over email or Slack
- If it is ever lost or compromised, immediately launch a new EC2 instance with a new key pair

### Protect the `.env` file
- Never commit it to git (the `.gitignore` file prevents this, but be aware)
- Never paste its contents into emails or messages
- If the database password needs to be changed, update the `.env` file on the server and restart the backend service

### Keep the server updated
Run these commands once a month to apply security patches:
```bash
sudo apt update && sudo apt upgrade -y
```

### Consider restricting SSH access
Currently, port 22 (SSH) is open to the entire internet. For better security, restrict it to your office's IP address:
1. EC2 → Security Groups → Edit inbound rules
2. For the SSH rule (port 22), change Source from "Anywhere" to "My IP"

> **Warning:** If your office IP changes (common with most networks), you will be locked out. Only do this if you have a static IP or are comfortable editing security group rules to restore access.

---

## 12. Contacts & Who to Ask for Help

| Question | Who to contact |
|----------|---------------|
| AWS access or account issues | **Sharon** — she manages department AWS accounts |
| Database credentials (`.env` file) | **Sharon** or the previous developer |
| Application bugs or code changes | The development team / developer who built the app |
| Server billing questions | **Sharon** or UMD IT |
| General IT support | UMD IT Help Desk: [https://itsupport.umd.edu](https://itsupport.umd.edu) |

### Useful links

| Resource | URL |
|----------|-----|
| AWS Console | https://console.aws.amazon.com |
| UMD IT Support | https://itsupport.umd.edu |
| AWS Free Tier info | https://aws.amazon.com/free |
| Node.js download | https://nodejs.org |
| Python download | https://python.org/downloads |

---

## Appendix A — Quick Reference Card

### Local development (your own computer)

```bash
# Start backend (in terminal 1)
cd ~/Desktop/GradSurveyUI/backend
source venv/bin/activate
python main.py

# Start frontend (in terminal 2)
cd ~/Desktop/GradSurveyUI
npm run dev
# Open http://localhost:5173 in browser
```

### Deployment update (after code changes)

```bash
# From LOCAL terminal — upload files
rsync -avz --exclude='node_modules' --exclude='dist' --exclude='backend/venv' \
  -e "ssh -i ~/Desktop/gradsurvey-key.pem" \
  ~/Desktop/GradSurveyUI/ \
  ubuntu@3.81.38.238:/home/ubuntu/GradSurveyUI/

# From SSH terminal — rebuild and restart
cd /home/ubuntu/GradSurveyUI
npm run build
sudo systemctl restart gradsurvey
```

### Server management commands (from SSH)

```bash
sudo systemctl status gradsurvey     # Check backend status
sudo systemctl restart gradsurvey    # Restart backend
sudo systemctl restart nginx         # Restart web server
sudo journalctl -u gradsurvey -f     # Watch backend logs live
sudo journalctl -u gradsurvey -n 50  # Last 50 lines of logs
df -h                                 # Check disk space
```

---

## Appendix B — Glossary

| Term | Plain English Definition |
|------|--------------------------|
| **AWS** | Amazon Web Services — Amazon's cloud computing platform where you rent virtual computers |
| **EC2** | The AWS service that provides virtual computers (servers) |
| **Elastic IP** | A permanent, fixed internet address for your server |
| **SSH** | A secure way to remotely control a server by typing text commands |
| **.pem file** | Your "key" to log into the server — keep it safe |
| **Nginx** | Web server software that handles browser requests and routes them correctly |
| **systemd** | Linux's built-in system for managing long-running background services |
| **npm** | Node Package Manager — downloads JavaScript libraries |
| **pip** | Python's package manager — downloads Python libraries |
| **venv** | A self-contained Python environment for one project |
| **Frontend** | The visual interface you see in the browser |
| **Backend** | The server-side program that handles data and business logic |
| **API** | A standard way for the frontend and backend to communicate |
| **PostgreSQL** | The database that stores all student data |
| **Security Group** | AWS's firewall — controls which network traffic is allowed |
| **Ubuntu** | A popular Linux operating system used on the server |
| **rsync** | A command-line tool for efficiently copying files to a remote server |
| **Port** | A numbered "door" on a server — different ports serve different purposes (80 = web, 22 = SSH) |
| **dist/** | The compiled, production-ready version of the frontend |

---

*Last updated: March 2026*
*Application: Graduate Survey UI (GradSurveyUI)*
*Platform: AWS EC2, Ubuntu 22.04 LTS*
