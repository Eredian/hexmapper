class HexTile {
    x: number;
    y: number;
    color: TileColor;
    borderColor: BorderColor;
    image: string;
    explored: boolean = false;
    info: HexTileInfo;
}