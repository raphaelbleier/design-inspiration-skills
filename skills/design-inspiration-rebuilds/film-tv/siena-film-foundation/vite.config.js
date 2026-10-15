// base './' keeps every asset URL relative so dist/ works under any sub-path.
// The app uses hash routing (#/work) for the same reason: no server rewrites needed.
export default { base: './', build: { assetsInlineLimit: 0 } };
