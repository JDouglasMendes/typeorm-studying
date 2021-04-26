import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Resolution } from "./resolution";

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column()
    description: string;
    @Column()
    filename: string;
    @Column()
    views: number;
    @Column()
    isPublished: boolean;
    @OneToMany(() => Resolution, resolution => resolution.photo )
    resolutions : Resolution[]
    
    public addResolution(resolution : Resolution) : void{
        if(!this.resolutions)
            this.resolutions = [];

        this.resolutions.push(resolution);
    }
}