// base './' keeps every asset URL relative; the app uses hash routing (#/works) so no server rewrites are needed.
export default { base: './', build: { assetsInlineLimit: 0 } };
