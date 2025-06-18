
export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
  } else if (diffInDays < 30) {
    return `${diffInDays} dia${diffInDays !== 1 ? 's' : ''}`;
  } else {
    return date.toLocaleDateString('pt-BR');
  }
};
