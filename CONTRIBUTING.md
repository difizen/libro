# Contribution Guide

If you have any questions, feel free to submit an [issue](https://github.com/difizen/libro/issues) or a [PR](https://github.com/difizen/libro/pulls)!

---

## Contributing Issues

- Determine the type of issue.
- Avoid submitting duplicate issues. Search existing issues before creating a new one.
- Fill out the issue form as completely as possible.
- Clearly indicate your intent in the tags, title, or description.

Once submitted, the **libro** maintainers will confirm the issue, update appropriate tags, and assign a developer.

---

## Contributing Code

### Fork the Repository

1. Click the “Fork” button on the project page to fork the repository you want to contribute to.

2. Clone the forked repository to your local machine using the following command:

```bash
git clone https://github.com/<YOUR-GITHUB-USERNAME>/libro
```

Replace `<YOUR-GITHUB-USERNAME>` with your GitHub username.

---

### Start the libro Server

1. Clone the libro-server repository to your local machine:

   ```bash
   git clone https://github.com/difizen/libro-server.git
   ```

2. We use rye to manage a Python monorepo containing multiple packages that share the same virtual environment (`venv`). Make sure you have Python installed and the rye Python management tool set up.

3. Install and synchronize the required Python dependencies:

   ```bash
   rye sync
   ```

4. Start the libro server:

   ```bash
   cd libro
   rye run dev
   ```

If everything works, you will see the libro service running successfully.

---

### Start libro

Switch to your [forked repository](#fork-the-repository).

1. Install and synchronize the required dependencies:

   ```bash
   pnpm bootstrap
   ```

2. Start the project in demo development mode:

   ```bash
   pnpm run docs
   ```

3. Begin developing your code.

---

### Adding a Changelog

1. Run the following command to create a changelog entry for your changes:

   ```bash
   pnpm run changeset
   ```

2. Follow the prompts to provide the following details:

   - Which packages were modified?
   - Are these changes major, minor, or patch?
   - Add a brief description of the changes.

---

### Submitting a Pull Request

Create a new branch for your changes and submit a PR. The libro team will review your code and merge it into the main branch.

```bash
# Create a meaningful branch name (avoid names like 'update' or 'tmp')
git checkout -b branch-name

# Run tests to ensure everything passes. Add or modify tests as needed.
pnpm run ci:check

# After testing, commit your changes. Use a commit message that follows the convention below.
git add .  # Use git add -u to stage deletions
git commit -m "fix(role): role.use must xxx"
git push origin branch-name
```

After pushing, create a [Pull Request](https://github.com/difizen/libro/pulls) on the libro repository.

When submitting a PR, ensure it includes the following for better traceability:

1. Requirements: Link to the related issue or add comments.
2. Reason for Changes: Briefly explain why the changes are necessary.
3. Test Points: Highlight critical test points (or link to test files).
4. Key Areas of Attention: Mention anything users need to know, such as non-compatible updates.

---

### Code Style

Your code must adhere to eslint rules. You can run the following command locally to test:

```bash
pnpm run lint
```

---

### Commit Guidelines

Follow the [Angular commit guidelines](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit-message-format) for clear commit history and automatic changelog generation.

```xml
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

1. Type
   The type of commit, such as:

   - feat: New feature
   - fix: Bug fix
   - docs: Documentation changes
   - style: Code format changes (no functional impact)
   - refactor: Code refactoring (no functional impact)
   - perf: Performance improvements
   - test: Add or modify tests
   - chore: Tooling changes (e.g., docs, code generation)
   - deps: Dependency upgrades

2. Scope
   Specify the scope of the files modified.

3. Subject
   Write a brief description of what the commit does.

4. Body
   Expand on the subject with reasons or other relevant details (optional).

5. Footer
   - Breaking Changes: Clearly describe any breaking changes here.
   - Linked Issues: Reference related issues, e.g., `Closes #1, Closes #2, #3`.

For more details, check the [Angular Commit Guidelines](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit).
