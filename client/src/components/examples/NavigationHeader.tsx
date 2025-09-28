import NavigationHeader from '../NavigationHeader';

export default function NavigationHeaderExample() {
  return (
    <NavigationHeader 
      userType="admin" 
      userName="Douglas Silva"
      onMenuClick={() => console.log('Menu clicked')}
      onLogout={() => console.log('Logout clicked')}
    />
  );
}