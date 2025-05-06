import { Input } from 'antd';
import { useRef, useState } from 'react';
import { FlexRow } from '../styleBox';
import CoverItem from './CoverItem/CoverItem';
import style from './style.less';

const selectedStyle = {
    transform: "scale(1.3)"
}

const selectOption = [
    'img', 'text'
]
export default function CoverSelector({ value, onChange, defaultValue, ...props }) {
    // console.log("value", value);
    // console.log("change", onChange);  //改变formitem value 的回调
    // value   {src: 'https://ico.n3v.cn/get.php?url=https://bilibili.com', type: 'img'}    这里是formitem的value
    const controlled = value !== undefined; // controlled  true    受控就是通过状态来管理
    const currentRef = useRef(controlled ? value : defaultValue); // currentRef.current 存放当前存放img还是text
    // console.log("Ref", currentRef.current.type);

    if (controlled) {
        currentRef.current = value;
    }
    const [_, update] = useState({})
    const forceUpdate = (v) => { // v: {src: 'https://ico.n3v.cn/get.php?url=https://bilibili.com', type: 'img'}
        currentRef.current = v;
        update({})
        onChange?.(v)
    }

    const handleSelect = (type) => {
        forceUpdate({ ...currentRef.current, type });
    }

    const handleChange = (e) => {
        const value = e.target.value;
        forceUpdate({ ...currentRef.current, text: value })
    }
    return (
        <div className={style.selectBox} {...props}>
            {currentRef.current?.type === 'text' ? <Input value={currentRef.current?.text} onChange={handleChange} /> : undefined}
            <FlexRow>
                {selectOption.map((type) => {
                    const selected = currentRef.current?.type; // 当前选择的图标类型
                    // console.log("selected", currentRef.current);
                    // console.log("type", type);


                    const coverInfo = { ...currentRef.current, type }
                    // console.log("coverInfo", coverInfo);
                    return <CoverItem
                        key={type}
                        coverInfo={coverInfo}
                        style={selected === type ? selectedStyle : undefined}
                        onClick={() => { handleSelect(type) }} // 改变当前ref
                    />
                })}
            </FlexRow>
        </div>
    )
}
