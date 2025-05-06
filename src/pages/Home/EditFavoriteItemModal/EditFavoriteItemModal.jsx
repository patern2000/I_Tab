import CoverSelector from '@/components/CoverSelector';
import { db } from '@/utils/indexDBUtils/db';
import { EditTwoTone, PlusSquareTwoTone } from '@ant-design/icons';
import { useDispatch, useSelector } from '@umijs/max';
import { Button, Form, Input, Modal, Select } from 'antd';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';


export default function EditFavoriteItemModal() {
    const dispatch = useDispatch();
    const { editVisible, currentItem } = useSelector(state => state.home);// currentItem 就是收藏项   editVisible一变化就会重新渲染
    const [form] = Form.useForm();
    const favoritesFolder = useLiveQuery(
        () => db["favoritesFolder"].toArray()
    );

    // console.log("fav Folder", favoritesFolder);

    useEffect(() => {// 也可以根据标题， 看编辑还是新增，从而选择填充或则重置表单
        if (currentItem) {// 填充表单数据， cover需要单独填充
            form.setFieldsValue(currentItem); // setFieldsValue(x )  x是一个对象 键是表单字段名
            changeCover(currentItem.url);
        }
    }, [currentItem])


    const onSave = async () => {// 也可以设置为onOk 的回调
        try {
            const favoriteItem = await form.validateFields();
            // console.log("fav", favoriteItem);// 为什么不执行?

            if (currentItem) {// 判断是不是编辑收藏项   调用后端编辑接口
                //修改
                db.favoritesItem.update(currentItem.id, favoriteItem)
            } else {// 新增收藏项   调用后端新增接口
                const folder = await db.favoritesFolder.where({ typeName: favoriteItem.typeName }).limit(1).toArray(); // 找到folder 文件夹
                if (folder?.length === 1) {
                    //保存到IndexedDb
                    // console.log("folderId", { ...favoriteItem, folderId: folder[0].id });

                    db.favoritesItem.add({ ...favoriteItem, folderId: folder[0].id })
                }
            }
            onCancel(); // 关闭框

        } catch (err) {
            console.log(err);

        }
    }

    const onCancel = () => {
        dispatch({ type: 'home/save', config: { editVisible: false, currentItem: null } })
        form.resetFields();
    }

    const onChange = _.debounce((e) => {
        const address = e.target.value;// e.target 为input框
        let url = address
        if (!url.startsWith("http://") && !address.startsWith("https://")) {
            url = "https://" + url;
        }
        console.log(url)
        changeCover(url);
    }, 300);

    const changeCover = async (url) => {
        //目前该接口直接返回favico，为此我们模拟获取到了Url
        // const result = await addressValidator(null, address)
        //     .then(() => {
        //         const params = {
        //             url: e.target.value
        //         }

        //         const res = axios.get(`https://api.7585.net.cn/getico/api.php?${stringify(params)}`);
        //         return res;
        //     })
        //     .catch(err => {
        //         console.log(err);
        //         message.info("获取失败,请检查地址或使用Text图标");
        //     });
        form.setFieldValue('cover', { src: `https://ico.n3v.cn/get.php?url=${url}` })
    }

    const addressValidator = (_, value) => {
        // console.log("value", value)
        if (!value) {
            return Promise.reject("请填写地址");
        }
        const regUrl = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+(\.[a-zA-Z]{2,})?([/a-zA-Z0-9._%+-]*)*$/;   //https://www.bilibili.com/
        if (regUrl.test(value.trim())) {
            return Promise.resolve();
        }
        return Promise.reject("地址有误");
    }

    return (
        <Modal
            open={editVisible}
            onCancel={onCancel}
            footer={[<Button key="save" type='primary' size='large' onClick={onSave}>Save</Button>]}  // 可以不用设置onOk， onOK的逻辑放在footer里的button来处理
            title={
                currentItem ?
                    <><EditTwoTone style={{ marginRight: 8 }} /> 编辑收藏项</> :
                    <><PlusSquareTwoTone style={{ marginRight: 8 }} /> 添加收藏项</>
            }
            zIndex={101}
        >
            <Form name='favoritItem' layout='vertical' size='large' form={form} requiredMark={false} validateTrigger="onSubmit">
                <Form.Item hidden na me="id">
                    <Input />
                </Form.Item>
                <Form.Item label="网址：" name="url" rules={[{ required: true, validator: addressValidator }]}  >
                    <Input placeholder='https://...' allowClear onChange={onChange} />
                </Form.Item>
                <Form.Item label="名称：" name="name" rules={[{ required: true }]}>
                    <Input allowClear />
                </Form.Item>
                <Form.Item label="分类：" name="typeName" rules={[{ required: true }]}>
                    <Select>
                        {favoritesFolder && favoritesFolder?.map((folder, index) => {// && 返回第一个假值
                            return <Select.Option key={index} value={folder?.typeName}>{folder?.typeName}</Select.Option>
                        })}
                    </Select>
                </Form.Item>
                <Form.Item label="图标：" name="cover" rules={[{ required: true }]} >
                    <CoverSelector />
                </Form.Item>
            </Form>
        </Modal >
    )
}
