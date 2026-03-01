# Push this project to work Git

## 1. Set your work identity (one-time)

If you haven’t already, edit **`D:\Work\.gitconfig-work`** and set your real work name and email.

This repo is already configured to use the work profile for commits.

## 2. Add your work remote and push

Replace `YOUR_WORK_GIT_URL` with your actual work repo URL, e.g.:

- GitHub: `https://github.com/your-company/epaper-app.git`
- Azure DevOps: `https://dev.azure.com/your-org/your-project/_git/epaper-app`
- GitLab: `https://gitlab.com/your-company/epaper-app.git`

Then run in this folder (`epaper-app`):

```powershell
cd D:\Dad\Epaper\epaper-app

git remote add work YOUR_WORK_GIT_URL
git push -u work master
```

If your work repo uses branch `main` instead of `master`:

```powershell
git branch -M main
git remote add work YOUR_WORK_GIT_URL
git push -u work main
```

When prompted, sign in with your **work** account (Git will remember it for this repo).
