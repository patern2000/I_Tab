import IBackground from '@/components/IBackground';
import IFloatButton from '@/components/IFloatButton';
import { DarkIcon, LightIcon } from '@/components/icons';
import { Flex, FlexColumn } from '@/components/styleBox';
import { setCssVar } from '@/utils/common';
import { db } from '@/utils/indexDBUtils/db';
import { getStorage } from '@/utils/localStorageUtils';
import { Outlet, useDispatch, useSelector } from '@umijs/max';
import { ConfigProvider } from 'antd';
import { useEffect, useState } from 'react';
import BasicNavigator from './BasicNavigator';

export default function BasicLayout() {
    const dispatch = useDispatch();
    const userState = useSelector((state) => state.user);
    const { wallpaper } = useSelector((state) => state.home);

    useEffect(() => {
        dispatch({
            type: 'home/change',
            config: { wallpaper: getStorage('wallpaper', 'object') },
        });
    }, []);// 如果页面刷新就从本地存储中，取出壁纸存入dva中
    const [themIcon, setThemeIcon] = useState(<LightIcon />);
    useEffect(() => {
        setCssVar('--theme-bgc', '#fff');
        setCssVar('--theme-color', '#333');
        setCssVar('--theme-shadow', '#fff');
        setCssVar('--card-bgc', '#fff');
        setCssVar('--card-color', '#333');
        return () => {
            db.close();
        };
    }, []);

    const togggleTheme = () => {
        const style = window.getComputedStyle(document.documentElement);// document.documentElement 其实就是html元素
        // const sty = document.documentElement.style.getPropertyValue('--theme-bgc')
        if (style.getPropertyValue('--theme-bgc') === '#333') {
            setCssVar('--theme-bgc', '#fff');
            setCssVar('--theme-color', '#333');
            setCssVar('--theme-shadow', '#fff');
            setThemeIcon(<LightIcon />);
            return;
        }
        setCssVar('--theme-bgc', '#333');
        setCssVar('--theme-color', '#fff');
        setCssVar('--theme-shadow', '#333');
        setThemeIcon(<DarkIcon />);
    };
    return (
        <ConfigProvider
            theme={{
                components: {// 对于单个组件的具体样式属性进行调整
                    Modal: {
                        contentBg: 'var(--theme-bgc)',
                        headerBg: 'var(--theme-bgc)',
                        titleColor: 'var(--theme-color)',
                    },
                    Input: {
                        activeBorderColor: '#fff',
                        hoverBg: '#fff',
                        hoverBorderColor: '#eee',
                    },
                },
                token: {
                    colorBgElevated: 'var(--theme-bgc)',//会影响到像模态框、下拉菜单等具有较高层级的元素的背景颜色
                    colorText: 'var(--theme-color)',//影响文本颜色
                },
            }}
        >
            <FlexColumn>
                <Flex>
                    <Outlet />
                </Flex>
                <BasicNavigator />
                <IFloatButton
                    onClick={togggleTheme} // 切换主题
                    icon={themIcon}
                    style={{
                        right: 74,
                        top: 16,
                        zIndx: 9,
                    }}
                />
                <IBackground videoSource={wallpaper?.videoSrc} src={wallpaper?.src} />
            </FlexColumn>
        </ConfigProvider>
    );
}
