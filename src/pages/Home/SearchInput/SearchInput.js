import { BaiduIcon, GithubIcon } from '@/components/icons';
import { FlexColumnCenter } from '@/components/styleBox';
import { isRelNull } from '@/utils/common';
import { Input, List, Select, Space } from 'antd';
import jsonp from 'fetch-jsonp';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import style from '../style.less';

const defaultSearchConfig = [
    {
        value: 'baidu',
        label: <BaiduIcon />,
        addonBefore: 'https://www.baidu.com/s?tn=39042058_40_oem_dg&ie=utf-8&wd='
    },
    {
        value: 'github',
        label: <GithubIcon />,
        addonBefore: 'https://github.com/search?q=',
        addonAfter: '&type=repositories'
    }
]

export default function SearchInput({ otherSearchConfig = [], inputProps, selectProps, ...props }) {
    const searchConfig = [
        ...defaultSearchConfig,
        ...otherSearchConfig
    ]
    const [currentSearchSite, setCurrentSearchSite] = useState('baidu'); //当前所使用的引擎
    const [searchValue, setSearchValue] = useState(null); // 搜索词 
    const [data, setData] = useState(null); //搜索建议数据   是一个对象数组 [{value: "s_1", label: "你好星期六"}]
    const searchRef = useRef();

    const onSearch = (value, e, { source }) => {// value就是当前搜索框的
        if (isRelNull(value) || source === 'clear') {
            return;
        }
        _.forEach(searchConfig, (o) => {
            if (o.value === currentSearchSite) {
                window.open(o?.addonBefore + encodeURIComponent(value) + (o?.addonAfter || ''), '_blank', 'noopener,noreferrer');
                setSearchValue(null);//清空输入框
                return;
            }
        })
    }

    //通过jsonp获取百度提供的搜索下拉词
    const fetchData = () => {
        if (searchValue && currentSearchSite === 'baidu') {
            jsonp(`https://www.baidu.com/sugrec?&prod=pc&wd=${searchValue}`)//百度搜索建议的接口 URL    这个本身就是个异步的
                .then((res) => res.json())
                .then((d) => {
                    if (d) {
                        const { g } = d; // g 是包含搜索建议的数据
                        if (g) {
                            let dataList = g.map((item) => {
                                return {
                                    label: item.q,
                                    value: item.sa,
                                }
                            });
                            setData(dataList);
                        }
                    }
                })
        } else {
            setData(null);
        }

    };

    const windoSearch = (e) => {
        e.preventDefault();
        const content = e.target.innerText;
        onSearch(content, e, { source: 'click' });
    }

    useEffect(() => {
        fetchData();
    }, [searchValue]);

    useEffect(() => {
        const focusSearchInput = () => {
            window.scroll({ top: 0, left: 0, behavior: 'smooth' });// 将页面滚动到顶部，并聚焦到搜索输入框
            searchRef && searchRef?.current && searchRef.current.focus(); //聚焦DOM搜索框
        }

        const windoKeyDownEvent = (event) => {
            if (event.ctrlKey && event.keyCode === 75) {
                event.preventDefault(); // 防止浏览器执行与该组合键相关的默认操作
                focusSearchInput();
            }
        }

        window.addEventListener("keydown", windoKeyDownEvent);

        return () => {
            window.removeEventListener("keydown", windoKeyDownEvent);
        }
    }, [])

    return (
        <FlexColumnCenter className={style.searchContainer}>
            <Space.Compact size='large' {...props}>
                <Select
                    defaultValue="baidu"
                    options={searchConfig}
                    value={currentSearchSite}
                    onChange={(value) => { setCurrentSearchSite(value) }}
                    {...selectProps}
                />
                <Input.Search
                    placeholder='输入搜索内容（Ctrl + K） '
                    allowClear
                    onSearch={onSearch}
                    value={searchValue}
                    onChange={(e) => { setSearchValue(e.target.value) }}
                    onBlur={() => { setData("") }}
                    ref={searchRef}
                    {...inputProps}
                />
            </Space.Compact>
            <div className={style.dropDownContainer}>
                <div className={style.listContent}>
                    {data && <List
                        bordered
                        dataSource={data}
                        renderItem={(item) => (
                            <List.Item  >
                                <a onClick={windoSearch} className={style.selectedItem} target='_blank' style={{ width: '100%', color: '#333' }}>
                                    {item.label}
                                </a>
                            </List.Item>
                        )}
                    />}
                </div>
            </div>
        </FlexColumnCenter>
    )
}
