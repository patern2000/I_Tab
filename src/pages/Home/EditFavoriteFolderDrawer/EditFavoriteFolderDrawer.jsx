import CoverItem from '@/components/CoverSelector/CoverItem/CoverItem';
import DropDownTable from '@/components/DropDownTable';
import { db } from '@/utils/indexDBUtils/db';
import { useDispatch, useSelector } from '@umijs/max';
import { Drawer, Dropdown } from 'antd';
import { useLiveQuery } from 'dexie-react-hooks';
import _ from 'lodash';

export default function EditFavoriteFolderDrawer() {
    const disptach = useDispatch();
    const { folderManage } = useSelector((state) => state.home); // 控制抽屉的显示和隐藏
    const favoritesFolder = useLiveQuery(async () => {
        return await db.favoritesFolder.toArray();
    });

    console.log("favfolder", favoritesFolder);

    const favoritesItem = useLiveQuery(async () => {
        return await db.favoritesItem.toArray();
    });

    console.log("favitem", favoritesItem);  // favoritesItem就是一个对象数组

    const favoritesItemMap = _.groupBy(favoritesItem || [], 'folderId');
    console.log("favitemMap", favoritesItemMap) //分组之后的值


    const onClose = () => {
        disptach({ type: 'home/change', config: { folderManage: false } });
    };

    // const deleteFunc = async (id) => {
    //     //找出所有folderId 为 id 的item 并删除
    //     await db.favoritesItem
    //         .where('folderId')
    //         .equals(id)
    //         .delete()
    //         .then((deleteCount) => {
    //             console.info('级联删除了' + deleteCount + '个收藏项');
    //             db.favoritesFolder.delete(id);
    //         });
    // };

    const deleteFunc = async (id) => {
        // 先删除指定id 的收藏项
        try {
            const deleteCount = await db.favoritesItem.where("folderId").equals(id).delete();
            console.log('级联删除了' + deleteCount + '个收藏项')
            await db.favoritesFolder.delete(id)
            console.info('成功删除文件夹，id 为：' + id);

        } catch (err) {
            console.log(err);
        }

    }


    const updateFunc = async (id, value) => { // 更新分类名称
        await db.favoritesFolder.update(id, { typeName: value });
    };

    const onClick = async (action, favorItem) => {
        const actionName = action.key;
        if (actionName === 'delete') {
            await db.favoritesItem.delete(favorItem.id);
        }

        if (actionName === 'modify') {
            const currentItem = {
                id: favorItem.id,
                url: favorItem.url,
                name: favorItem.name,
                typeName: favorItem.typeName,
                cover: favorItem.cover,
            };
            disptach({ // 将当前项数据存入dva中
                type: 'home/change',
                config: { editVisible: true, currentItem },
            });
        }
    };

    const dropdownMenu = [
        {
            label: '修改',
            key: 'modify',
        },
        {
            label: '删除',
            key: 'delete',
        },
    ];

    return (
        <Drawer
            open={folderManage}
            onClose={onClose}
            placement="left"
            size="large"
            styles={{
                body: {
                    backgroundImage:
                        'linear-gradient(180deg,#DEF3F8 0%, #2caaec 85%, #1b87e3 100%)',
                },
                header: {
                    backgroundColor: '#dcf1f7',
                },
            }}
            zIndex={100}
        >
            {_.map(favoritesFolder || [], (folder, index) => {
                return (
                    <DropDownTable
                        title={folder?.typeName}
                        index={folder.id}
                        key={index}
                        deleteFunc={deleteFunc}
                        updateFunc={updateFunc}
                    >
                        {_.map(favoritesItemMap[folder.id] || [], (item, index) => {
                            // item.src = item.cover.src;
                            // item.type = item.cover.type;
                            // item.text = item.cover.text;
                            return (
                                <Dropdown
                                    menu={{
                                        items: dropdownMenu,
                                        onClick: (action) => {
                                            onClick(action, item);// action 是菜单项，
                                        },
                                    }}
                                    trigger={['contextMenu']}
                                    key={index}
                                >
                                    <CoverItem coverInfo={item} />
                                </Dropdown>
                            );
                        })}
                    </DropDownTable>
                );
            })}
        </Drawer>
    );
}
