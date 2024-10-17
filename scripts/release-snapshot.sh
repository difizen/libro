# release snapshot version for test, should do in separate branch, not need to merge back
# first need `pnpm changeset`
pnpm changeset version --snapshot snapshot
pnpm changeset publish --tag snapshot --no-git-tag --snapshot
