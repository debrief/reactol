import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { execSync } from 'child_process'

// Get current git branch
function getCurrentGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
}

// Get current build date
function getCurrentBuildDate() {
  try {
    return execSync('git log -1 --format=%cd --date=iso-strict').toString().trim()
  } catch {
    return 'unknown'
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_GIT_BRANCH': JSON.stringify(getCurrentGitBranch()),
    'import.meta.env.VITE_BUILD_DATE': JSON.stringify(getCurrentBuildDate())
  }
})
