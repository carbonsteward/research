# Git Workflow Documentation

## Branch Structure

### Main Branches
- **`main`**: Production-ready code. Protected branch with strict rules.
- **`develop`**: Integration branch for feature development. All feature branches merge here.

### Feature Branches
- **`feature/*`**: Individual features (e.g., `feature/add-ci-pipeline`)
- **`fix/*`**: Bug fixes (e.g., `fix/database-connection`)
- **`chore/*`**: Maintenance tasks (e.g., `chore/update-dependencies`)

## Branch Protection Rules

### Main Branch Protection
Required settings for `main` branch:
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Include administrators in restrictions
- ❌ Allow force pushes: false
- ❌ Allow deletions: false

### Develop Branch Protection
Required settings for `develop` branch:
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ❌ Include administrators in restrictions (more flexible)

## Commit Message Standards

### Conventional Commit Format
```
type(scope): description

[optional body]

[optional footer(s)]
```

### Commit Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```bash
feat(git): establish repository foundation
fix(deployment): resolve vercel configuration issues
docs(workflow): add comprehensive git workflow documentation
test(api): add integration tests for methodology endpoints
```

## Workflow Process

### Feature Development
1. **Create Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Development Work**
   ```bash
   # Make changes
   git add .
   git commit -m "feat(scope): description"
   ```

3. **Keep Updated**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/your-feature-name
   git rebase develop
   ```

4. **Create Pull Request**
   - Target: `develop` branch
   - Include: Description, testing notes, breaking changes
   - Ensure: All CI checks pass

### Release Process
1. **Create Release Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/v1.x.x
   ```

2. **Release Preparation**
   - Update version numbers
   - Update changelog
   - Final testing

3. **Deploy to Production**
   ```bash
   # Merge to main
   git checkout main
   git merge release/v1.x.x
   git tag v1.x.x
   git push origin main --tags

   # Merge back to develop
   git checkout develop
   git merge main
   ```

## Repository Configuration Notes

**Current Repository Status:**
- Remote URL: `https://github.com/carbonsteward/TWIGA_v2.git`
- ⚠️ **Action Required**: Update remote URL to correct ChatPDD repository
- Branch structure: `main` and `develop` branches created

**To Update Remote (when ChatPDD repository is created):**
```bash
git remote set-url origin https://github.com/[organization]/ChatPDD.git
git push -u origin main
git push -u origin develop
```

## Pre-commit Hooks

The repository includes pre-commit hooks that automatically:
- ✅ Trim trailing whitespace
- ✅ Fix end of files
- ✅ Check YAML syntax
- ✅ Prevent large files (>500KB)
- ✅ Run Python code quality checks (when applicable)

## CI/CD Integration

**Current Status**: Foundation established for CI/CD integration
**Next Steps**: Story 1.2 will implement GitHub Actions workflows

**Required Status Checks** (to be implemented):
- ✅ TypeScript compilation
- ✅ ESLint validation
- ✅ Unit tests pass
- ✅ E2E tests pass
- ✅ Build succeeds

## Emergency Procedures

### Rollback Commit
```bash
# Revert last commit (safe)
git revert HEAD

# Reset to previous commit (destructive)
git reset --hard HEAD~1
```

### Emergency Branch Protection Disable
Contact repository administrator to temporarily disable protection rules for emergency fixes.

### Lost Work Recovery
```bash
# Find lost commits
git reflog

# Recover lost commit
git checkout <commit-hash>
git checkout -b recovery-branch
```

---

This workflow documentation establishes the foundation for ChatPDD CI/CD modernization with proper git management and collaboration processes.
