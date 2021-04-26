import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Photo } from "./photo";

@Entity()
export class Resolution {
    @PrimaryGeneratedColumn()
    public id: number;
    @ManyToOne(() => Photo, p => p.resolutions, {onDelete: 'CASCADE' })
    public photo: Photo;
    @Column()
    public description: string;
    @Column()
    public isMobileFirst: boolean;
}
