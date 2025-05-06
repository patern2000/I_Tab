import Dexie, { Table } from 'dexie';

interface FavoritesFolder {
    id?: number;
    typeName: string;
}

interface Cover {
    type: 'img' | 'text';
    src: string;
}

interface FavoritesItem {
    id?: number;
    folderId: number;
    name: string;
    typeName: string;
    url?: string;
    cover: Cover;
}

export class FavoritesDB extends Dexie {// 创建一个数据库FavoritesDB
    favoritesFolder!: Table<FavoritesFolder, number>;
    favoritesItem!: Table<FavoritesItem, number>;
    constructor() {
        super('FavoritesDB');// 数据库名称
        this.version(1).stores({// store 定义数据库表的结构  键是表名， 值是主键和索引定义
            favoritesFolder: '++id, typeName',
            favoritesItem: '++id, folderId, typeName', // 这些字段都是作为索引的字段
        });
    }

    deleteFolder(folderId: number) {
        return this.transaction(
            'rw',
            this.favoritesItem,
            this.favoritesFolder,
            () => {
                this.favoritesItem.where({ folderId: folderId }).delete();// foldID就是收藏文件夹的ID
                this.favoritesFolder.delete(folderId);
            },
        );
    }
}

export const db = new FavoritesDB();
