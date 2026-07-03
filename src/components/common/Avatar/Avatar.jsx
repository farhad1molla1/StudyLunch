import React from 'react';

const Avatar = ({ image, name = 'User', size = '40px' }) => {
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: `calc(${size} / 2.5)` }}>
      {image ? (
        <img src={image} alt={name} />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

export default Avatar;