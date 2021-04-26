import { Connection, Repository } from "typeorm";
import MyConnection from "../src/app";
import { Photo } from "../src/models/photo";

describe('Photo update using mysql repository of typeOrm', () => {
    let connection : Connection;
    let repository : Repository<Photo>;
    let photoSaved : Photo;
    beforeAll(async () => {
        connection = await MyConnection();
        repository = connection.getRepository(Photo);
    });
    function createPhoto () {
        let photo = new Photo();
        photo.description = "Description";
        photo.filename = "xpto.jpg";
        photo.isPublished = false;
        photo.name = "xpto";
        photo.views = 0;
        return photo;
    };
    beforeEach(async () => {
        const photo = await repository.save(createPhoto());
        photoSaved = await repository.save(photo)
    });
    it('should update the description the photo with repositoty', async () => {        
        photoSaved.description = 'description updated';
        const { id }  = photoSaved;
        await repository.update(id, photoSaved); 
        const result = await repository.findOne(id);
        expect(photoSaved.description).toEqual(result.description);
    });
});