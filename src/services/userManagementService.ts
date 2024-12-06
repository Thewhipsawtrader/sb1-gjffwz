import { v4 as uuidv4 } from 'uuid';
import { UserCommand, ManagedUser } from '../types/userManagement';
import { ErrorReporter } from './errorReporter';
import { WhatsAppService } from './whatsapp';

export class UserManagementService {
  private static instance: UserManagementService;
  private users: Map<string, ManagedUser> = new Map();

  private constructor() {}

  static getInstance(): UserManagementService {
    if (!UserManagementService.instance) {
      UserManagementService.instance = new UserManagementService();
    }
    return UserManagementService.instance;
  }

  async executeCommand(command: UserCommand, executedBy: string): Promise<{ success: boolean; message: string }> {
    try {
      switch (command.type) {
        case 'ADD_USER':
          return await this.addUser(command, executedBy);
        case 'REMOVE_USER':
          return await this.removeUser(command, executedBy);
        case 'UPDATE_USER':
          return await this.updateUser(command, executedBy);
        default:
          throw new Error('Invalid command type');
      }
    } catch (error) {
      ErrorReporter.getInstance().reportError({
        category: 'USER_MANAGEMENT',
        message: `Failed to execute ${command.type}: ${error.message}`,
        context: {
          command,
          executedBy,
        },
      });
      return { success: false, message: error.message };
    }
  }

  private async addUser(command: UserCommand, executedBy: string): Promise<{ success: boolean; message: string }> {
    // Generate username if not provided
    const username = command.username || this.generateUsername(command.firstName, command.lastName, command.unitNumber);
    
    // Generate password if not provided
    const password = command.password || this.generatePassword();

    const user: ManagedUser = {
      id: uuidv4(),
      firstName: command.firstName,
      lastName: command.lastName,
      unitNumber: command.unitNumber,
      username,
      createdAt: new Date().toISOString(),
      createdBy: executedBy,
    };

    this.users.set(user.id, user);

    // Notify via WhatsApp
    await WhatsAppService.sendMessage(
      `🆕 New User Added\n` +
      `• Name: ${user.firstName} ${user.lastName}\n` +
      `• Unit: ${user.unitNumber}\n` +
      `• Username: ${username}\n` +
      `• Added by: ${executedBy}`
    );

    return {
      success: true,
      message: `User added successfully. Username: ${username}, Password: ${password}`,
    };
  }

  private async removeUser(command: UserCommand, executedBy: string): Promise<{ success: boolean; message: string }> {
    const user = Array.from(this.users.values()).find(
      u => u.firstName === command.firstName && 
          u.lastName === command.lastName &&
          (!command.unitNumber || u.unitNumber === command.unitNumber)
    );

    if (!user) {
      throw new Error('User not found');
    }

    this.users.delete(user.id);

    // Notify via WhatsApp
    await WhatsAppService.sendMessage(
      `❌ User Removed\n` +
      `• Name: ${user.firstName} ${user.lastName}\n` +
      `• Unit: ${user.unitNumber}\n` +
      `• Removed by: ${executedBy}`
    );

    return {
      success: true,
      message: `User ${user.firstName} ${user.lastName} removed successfully`,
    };
  }

  private async updateUser(command: UserCommand, executedBy: string): Promise<{ success: boolean; message: string }> {
    const user = Array.from(this.users.values()).find(
      u => u.firstName === command.firstName &&
          u.lastName === command.lastName &&
          u.unitNumber === command.unitNumber
    );

    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser: ManagedUser = {
      ...user,
      unitNumber: command.newUnitNumber || user.unitNumber,
      username: command.newUsername || user.username,
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: executedBy,
    };

    this.users.set(user.id, updatedUser);

    // Notify via WhatsApp
    await WhatsAppService.sendMessage(
      `📝 User Updated\n` +
      `• Name: ${user.firstName} ${user.lastName}\n` +
      `• Old Unit: ${user.unitNumber}\n` +
      `• New Unit: ${updatedUser.unitNumber}\n` +
      `${command.newUsername ? `• New Username: ${updatedUser.username}\n` : ''}` +
      `• Updated by: ${executedBy}`
    );

    return {
      success: true,
      message: `User updated successfully`,
    };
  }

  private generateUsername(firstName: string, lastName: string, unitNumber: string): string {
    const base = `${firstName.toLowerCase()}${unitNumber.replace(/[^0-9]/g, '')}`;
    return base.replace(/[^a-z0-9]/g, '');
  }

  private generatePassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  getAllUsers(): ManagedUser[] {
    return Array.from(this.users.values());
  }

  getUserByUnit(unitNumber: string): ManagedUser | undefined {
    return Array.from(this.users.values()).find(
      user => user.unitNumber === unitNumber
    );
  }
}