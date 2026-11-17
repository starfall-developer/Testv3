/* Starfall asset delivery settings. */
window.STARFALL_CONFIG = {
  siteName: 'Starfall',
  cdn: { enabled: false, githubUser: 'YOUR_GITHUB_USERNAME', githubRepo: 'YOUR_REPOSITORY', branch: 'main' },
  gameStorageBase: ''
};
window.starfallAsset = function (path) {
  const cfg = window.STARFALL_CONFIG.cdn;
  if (!cfg.enabled || !cfg.githubUser || cfg.githubUser.startsWith('YOUR_')) return path;
  return `https://cdn.jsdelivr.net/gh/${cfg.githubUser}/${cfg.githubRepo}@${cfg.branch}/${String(path).replace(/^\//, '')}`;
};