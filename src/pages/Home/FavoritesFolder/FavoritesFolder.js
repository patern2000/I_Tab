import CoverItem from '@/components/CoverSelector/CoverItem/CoverItem';
import { FlexAuto, FlexCenter, FlexColumn, MotionBox } from '@/components/styleBox';
import { db } from '@/utils/indexDBUtils/db';
import { CaretDownFilled, FolderAddTwoTone } from '@ant-design/icons';
import { useDispatch } from '@umijs/max';
import { Dropdown, Input, message } from 'antd';
import { useLiveQuery } from 'dexie-react-hooks';
import _ from 'lodash';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import styled from 'styled-components';
import style from './style.less';

// 允许在js中编写css， 创建一个组件
const DropDownWrapper = styled.div`
  text-align:center;
  width:100%;
  font-size:14px;
  font-weight:550;
`

const FavoritesFolder = forwardRef(function FavoritesFolder({ folder = {}, index, count = 0, onClickDownArrow, ...props }, ref) {  // ref是父组件的ref    父组件通过 ref 访问子组件的 DOM 节点或方法
    const dispatch = useDispatch();
    const [isEdit, setIsEdit] = useState(false);
    const singleFolderRef = useRef();
    const isLast = index + 1 === count;// index 表示当前是哪个文件夹
    //这样父组件就可以通过ref调用子组件方法
    useImperativeHandle(ref, () => { // 函数返回一个对象， 该对象的属性和方法被挂载到ref上，父组件可以通过ref访问这些内容
        return {// ref就是父组件传递过来的ref
            currentFolderHeight: () => {
                console.log(ref)
                return singleFolderRef.current.offsetHeight
            }
        }
    }, [index]);

    const addSite = (e) => {
        dispatch({ type: 'home/save', config: { editVisible: true } })
    }
    const favoritesItem = useLiveQuery(() => { // 一变化就会更新收藏项
        return db.favoritesItem.where({ folderId: folder.id }).toArray()
    }, [])

    const editFolder = (e) => {
        dispatch({  // 收藏夹管理作为true  感觉这个异步没啥用
            type: 'home/change',
            config: {
                folderManage: true
            }
        })
    }

    const createFolder = async (e) => {
        const typeName = e.target.value;
        if (_.isEmpty(typeName.trim())) { // 如果为空就返回
            return;
        }
        const existFolder = await db.favoritesFolder.where({ typeName }).toArray();// 异步操作等待完成
        if (existFolder.length > 0) {
            message.info('分类已存在，请重新命名🫥');
            return;
        }
        await db.favoritesFolder.add({ typeName });
    }

    const items = [
        {
            label: <DropDownWrapper >添加网址</DropDownWrapper>,
            key: 'addSite'
        },
        {
            label: <DropDownWrapper >编辑收藏夹</DropDownWrapper>,
            key: 'editFolder'
        },
    ];

    return (
        <>
            <Dropdown menu={{
                items,
                onClick: (item) => {// 点击菜单项调用的函数
                    if (item.key === "addSite")
                        addSite()
                    if (item.key === 'editFolder') editFolder()
                }
            }}
                trigger={['contextMenu']}  // 允许设置多种触发方式  右击
                {...props}
            >
                <FlexColumn className={style.folderBox} ref={singleFolderRef}>
                    <div className={style.folderItemContainer}>
                        {_.map(favoritesItem || [], (item, index) => {
                            const src = item.cover.src;
                            const text = item.cover.text;
                            const type = item?.cover?.type;
                            const coverInfo = { ...item, src, text, type }
                            return <CoverItem key={index} coverInfo={coverInfo} onClick={() => {
                                window.open(item.url);
                            }} />
                        })}
                    </div>
                    <FlexAuto />
                    {// MotionBox  就相当于给里面内容加动画
                        isLast ? <FlexCenter className={style.folderBoxFooter} onClick={() => { setIsEdit(!isEdit) }}>
                            <MotionBox whileHover={{ rotate: 360, transition: { duration: 0.5 } }}>
                                <FolderAddTwoTone title='添加文件夹' />
                            </MotionBox>
                            {
                                isEdit ?
                                    <MotionBox className={style.folderInupt} animate={{ scale: [0, 1, 0.8, 1] }}>
                                        <Input onPressEnter={createFolder} placeholder='输入新分类，回车创建' autoFocus />
                                    </MotionBox>
                                    : undefined
                            }
                        </FlexCenter> : <MotionBox
                            animate={{
                                y: -10,
                                transition: {
                                    repeat: Infinity,
                                    repeatType: 'mirror',
                                    duration: 2,
                                },
                            }}
                            onClick={() => { onClickDownArrow && onClickDownArrow() }}// 我是在这个子文件夹上执行的
                        >
                            <CaretDownFilled style={{ color: '#FFF', fontSize: '50px', cursor: 'pointer' }} />
                        </MotionBox>
                    }
                </FlexColumn>

            </Dropdown >
        </>
    )
})

export default FavoritesFolder;
