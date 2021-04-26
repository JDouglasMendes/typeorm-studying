import { Connection, Repository } from "typeorm";
import MyConnection from "../src/app";
import { Photo } from "../src/models/photo";
import { Resolution } from "../src/models/resolution";

describe('Add photo in mysql with typeOrm', () => {
    let connection : Connection;
    let repository : Repository<Photo>;
    let repositoryResolution: Repository<Resolution>;
    beforeAll(async () => {
        connection = await MyConnection();
        repository = connection.getRepository(Photo);
        repositoryResolution = connection.getRepository(Resolution);
    });

    function createPhoto () {
        let photo = new Photo();
        photo.description = "Description";
        photo.filename = "xpto.jpg";
        photo.isPublished = false;
        photo.name = "xpto";
        photo.views = 0;
        return photo;
    }

    function createResolution (id?: number) : Resolution
    {
        const resolution = new Resolution();
        resolution.description = 'sm-mobile';                    
        resolution.isMobileFirst = true;            
        if(id)
            resolution.id = id;
        return resolution;
    }

    afterAll(async () => {        
        await connection.close()
    });

    afterEach(async () => {
       await connection.createQueryBuilder().delete().from(Photo).where("id > :id", {id: 0}).execute();
    });

    it('should add new photo using repositories', async () => {
        const photo = await repository.save(createPhoto());
        expect(photo).not.toBeNull();
        expect(photo.id).toBeGreaterThan(0);        
    });

    it('should add 10 news photos using repositories in atomic command', async () => {
        const getData = () => Array.from(new Array(10), (_, __) => createPhoto());
        const photos = await repository.save(getData());
        expect(photos).not.toBeNull();
        expect(photos.length).toEqual(10);
        for (const photo of photos) {
            expect(photo.id).toBeGreaterThan(0);
        }        
    });

    it('should add new photo and resolution', async () => {        
        const resolution = createResolution();  
        const resolutionSaved = await repositoryResolution.save(resolution);
        expect(resolutionSaved.id).toBeGreaterThan(0);

        const photo = createPhoto();
        photo.addResolution(resolutionSaved);
        const photoSaved = await repository.save(photo);
        expect(photoSaved.id).toBeGreaterThan(0);
        
        const photoAndResolution = await repository.findOneOrFail(photoSaved.id, { relations: ["resolutions"] });
    
        expect(photoAndResolution).not.toBeNull();
        expect(photoAndResolution.id).toEqual(photoSaved.id);
        expect(photoAndResolution.resolutions).not.toBeNull();
        expect(photoAndResolution.resolutions.length).toEqual(1);
    });

    it('should add new photo and resolution with roolback transaction', async () => {        
        const resolution = createResolution();  
        const queryRunner = connection.createQueryRunner();
        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();
            let resolutionSaved = await queryRunner.manager.save(resolution)
            const photo = createPhoto();
            photo.addResolution(resolutionSaved);
            await queryRunner.manager.save(photo);
            await queryRunner.rollbackTransaction();
            const results = await connection.createQueryBuilder().select('res').from(Resolution, 'res').limit(1).execute();            
            expect(results.length).toEqual(0);
        }catch(error){
            fail(`error during execution test: ${error}`)
        }finally {
            await queryRunner.release();
        }                                         
    });

    it('should add new photo and resolution with commit transaction', async () => {
        const queryRunner = connection.createQueryRunner();
        let resolutionSaved : Resolution;
        let photoSaved : Photo;
        try {
            const resolution = createResolution();              
            await queryRunner.connect();
            await queryRunner.startTransaction();
            resolutionSaved = await queryRunner.manager.save(resolution)
            const photo = createPhoto();
            photo.addResolution(resolutionSaved);
            photoSaved = await queryRunner.manager.save(photo);
            await queryRunner.commitTransaction();
        }catch(error){
            await queryRunner.rollbackTransaction();
            fail(`error during execution test: ${error}`)
        }finally {
            await queryRunner.release();
        }                                         
        expect(resolutionSaved.id).toBeGreaterThan(0);
        const resolutionPosCommit = await repositoryResolution.findOneOrFail(resolutionSaved.id)
        expect(resolutionPosCommit.id).toEqual(resolutionSaved.id)

        expect(photoSaved.id).toBeGreaterThan(0);
        const photoPosCommit = await repository.findOneOrFail(photoSaved.id)        
        expect(photoSaved.id).toEqual(photoPosCommit.id)        
    });

});