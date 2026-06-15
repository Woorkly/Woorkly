/**
 * Avatar utilisateur : affiche une image Cloudinary ou un cercle avec initiales.
 * Utilisé dans GestionUser (liste + modals) et DashboardUser (header).
 *
 * Props :
 *   initiales  {string}  Lettres à afficher si pas d'image
 *   couleur    {string}  Couleur de fond du cercle initiales
 *   size       {number}  Diamètre en pixels (défaut : 36)
 *   avatar_url {string}  URL Cloudinary (https://...) ou undefined
 *
 * Usage : <Avatar initiales="JD" couleur="#1A56A0" size={48} avatar_url={user.avatar_url} />
 */

export default function Avatar({ initiales, couleur, size = 36, avatar_url }) {
  /* Une URL Cloudinary commence toujours par "http" */
  const isImage = typeof avatar_url === 'string' && avatar_url.startsWith('http');

  return (
    <div
      className="u-avatar"
      style={{
        width: size,
        height: size,
        background: isImage ? 'transparent' : couleur,
        fontSize: size * 0.35,
        overflow: 'hidden',
        padding: 0,
      }}
    >
      {isImage ? (
        <img
          src={avatar_url}
          alt={initiales}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        initiales
      )}
    </div>
  );
}
