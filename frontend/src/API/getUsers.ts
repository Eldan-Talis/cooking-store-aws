export interface CognitoUser {
  id: string;
  username: string;
  email: string;
  status: string;
  attributes: {
    role?: string;
  };
  userCreateDate: Date;
  lastLoginDate?: Date;
}

export const getUsersFromCognito = async (): Promise<CognitoUser[]> => {
  // Mock implementation - replace with actual Cognito API calls
  return [];
};

export const mapCognitoStatusToDisplay = (status: string): string => {
  switch (status) {
    case 'CONFIRMED':
      return 'active';
    case 'UNCONFIRMED':
      return 'pending';
    case 'ARCHIVED':
      return 'inactive';
    default:
      return 'unknown';
  }
};

export const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (status) {
    case 'active':
      return 'success';
    case 'pending':
      return 'warning';
    case 'inactive':
      return 'error';
    default:
      return 'default';
  }
}; 