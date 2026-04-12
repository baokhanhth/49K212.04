import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('OtpKhoiPhucMatKhau')
export class OtpKhoiPhucMatKhau {
    @PrimaryGeneratedColumn({ name: 'Id' })
    id: number;

    @Column({ name: 'Email', type: 'nvarchar', length: 80 })
    email: string;

    @Column({ name: 'Otp', type: 'varchar', length: 6 })
    otp: string;

    @Column({ name: 'ExpiresAt', type: 'datetime2' })
    expiresAt: Date;

    @Column({ name: 'IsUsed', type: 'bit', default: false })
    isUsed: boolean;

    @CreateDateColumn({ name: 'CreatedAt', type: 'datetime2' })
    createdAt: Date;
}