/* eslint-disable react/button-has-type */
import { forwardRef } from 'react';
import { MotionBox } from '../styleBox';
import style from './style.less';
import { useDispatch, useSelector } from '@umijs/max';
import { setStorage } from '@/utils/localStorageUtils';
const Wallpaper = forwardRef(({ paper, ...props }, ref) => {
    const dispatch = useDispatch();
    const setBackground = (e) => {
        e.preventDefault();
        e.stopPropagation(); // 确保点击事件不会向上传递
        // if (props.onClick) props.onClick(paper);
        dispatch({ type: 'home/change', config: { wallpaper: paper } }); // 将壁纸放入redux中，
        setStorage('wallpaper', paper, 'object');// 将壁纸放入本地存储
    };
    return (
        <MotionBox
            whileInView="onscreen"
            initial="offscreen"
            viewport={{ once: true }}
            variants={{
                offscreen: { y: 100 },
                onscreen: {
                    y: 0,
                    transition: {
                        type: 'spring',
                        duration: 0.8,  // offscreen 状态过渡到 onscreen 状态 0.8s
                    },
                },
            }}
            {...props}
            ref={ref}
            className={style.container}
        >
            <img src={paper.src} alt="wallpaper" className={style.image}></img>
            <div className={style.overlay} onClick={setBackground}>
                点击设置为壁纸
            </div>
        </MotionBox>
    );
});

export default Wallpaper;
