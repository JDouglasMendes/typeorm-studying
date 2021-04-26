import MyConnection from '../src/app';

describe("connection test", () => {

  it("connection test successfully", async () => {
    const connection = await MyConnection();
    expect(connection).not.toBeNull();
    expect(connection.isConnected).toBe(true);
    await connection.close();
    expect(connection.isConnected).toBe(false);
  });

});
