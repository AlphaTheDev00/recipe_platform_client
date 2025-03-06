const Navigation = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      {/* ... other navigation items ... */}
      {isAuthenticated && (
        <li className="nav-item">
          <Link className="nav-link" to="/favorites">
            <i className="bi bi-heart"></i> My Favorites
          </Link>
        </li>
      )}
      {/* ... */}
    </nav>
  );
};
