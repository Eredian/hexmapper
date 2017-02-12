import { TileColor } from './tilecolor';
export class UserSettings {
    selectedImage: string;
    selectedColor: TileColor;
    bigPaint: boolean = false;
    currentFavoriteImage: number = 0;
    drawHexNumbers: boolean = false;
}