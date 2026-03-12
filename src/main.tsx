import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {
    Settings,
    Calendar,
    Database,
    BarChart3,
    Plus,
    Save,
    Search,
    Trash2,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    ArrowUpDown,
    Gift,
    Coins,
    Ticket,
    LayoutDashboard,
    Clock,
    User
} from 'lucide-react';

/**
 * MOCK DATA & TYPES
 * based on Backend Design Document
 */

// Types
type WheelType = 'beginner' | 'intermediate' | 'advanced';

interface RewardConfig {
    id: string;
    itemId: string;
    itemName: string; // Mocked: normally fetched by ID
    count: number;
    weight: number;
    isGrandPrize: boolean;
}

interface WheelConfig {
    type: WheelType;
    name: string;
    maxRewards: number;
    rewards: RewardConfig[];
    grandPrizeId: string | null;
}

interface ActivityConfig {
    id: string;
    startTime: string;
    endTime: string;
    remarks: string;
    rulesZhCN: string;
    rulesZhTW: string;
    rulesJA: string;
    wheels: {
        beginner: WheelConfig;
        intermediate: WheelConfig;
        advanced: WheelConfig;
    };
    lastOperator: string;
    lastUpdateTime: string;
}

interface GeneralConfig {
    globalEnabled: boolean;
    ticketItemId: string;
    upgradeItemId: string;
    singleDrawCost: number;
    tenDrawCost: number;
    dailyExchangeLimit: number;
    purchaseItems: Array<{ itemId: string; count: number }>;
    purchasePrice: number;
}

interface DrawRecord {
    id: string;
    userId: string;
    drawTime: string;
    drawType: 'single' | 'ten';
    cost: number;
    rewardId: string;
    rewardName: string;
    rewardCount: number;
    status: 'success' | 'fail';
    rewards?: Array<{ rewardName: string; rewardCount: number }>;
}

type RewardType = 'currency' | 'skin' | 'clothing' | 'consumable';
type RewardQuality = 'common' | 'fine' | 'rare' | 'excellent' | 'epic' | 'legendary';

interface RewardOutput {
    id: string;
    activityId: string;
    wheel: WheelType;
    rewardName: string;
    rewardType: RewardType;
    quality: RewardQuality;
    quantity: number;
    date: string;
}

// Mock Data
const MOCK_GENERAL_CONFIG: GeneralConfig = {
    globalEnabled: true,
    ticketItemId: "item_1001",
    upgradeItemId: "item_9999",
    singleDrawCost: 1,
    tenDrawCost: 10,
    dailyExchangeLimit: 1000,
    purchaseItems: [
        { itemId: 'item_1001', count: 1 },
        { itemId: 'item_2002', count: 5 }
    ],
    purchasePrice: 100
};

const INITIAL_WHEEL_CONFIG = (type: WheelType, name: string, max: number): WheelConfig => ({
    type,
    name,
    maxRewards: max,
    rewards: [],
    grandPrizeId: null
});

const MOCK_ACTIVITIES: ActivityConfig[] = [
    {
        id: "ACT_20231001",
        startTime: "2025-10-01 00:00:00",
        endTime: "2025-10-07 23:59:59",
        remarks: "十一国庆节活动",
        rulesZhCN: "1. 每个玩家每天最多可以参与1000次\n2. 轮盘中的所有奖项有概率\n3. 需要使用星豆总票参与抽奖",
        rulesZhTW: "1. 每個玩家每天最多可以參與1000次\n2. 轉盤中的所有獲獎項有機率\n3. 需要使用星豆總券參與抽獲",
        rulesJA: "1. 各プレイヤーは1日最多5・10000回の参加\n2. 転盤の上貯を控紅して\n3. 星を使用して吹吹を功窮してください",
        lastOperator: "admin_01",
        lastUpdateTime: "2025-09-25 14:30:00",
        wheels: {
            beginner: {
                type: 'beginner',
                name: '初级转盘',
                maxRewards: 15,
                grandPrizeId: 'rw_02',
                rewards: [
                    { id: 'rw_01', itemId: 'gold', itemName: '金币', count: 1000, weight: 500, isGrandPrize: false },
                    { id: 'rw_02', itemId: 'skin_01', itemName: '普通皮肤', count: 1, weight: 10, isGrandPrize: true },
                    { id: 'rw_03', itemId: 'gold', itemName: '金币', count: 500, weight: 400, isGrandPrize: false },
                    { id: 'rw_04', itemId: 'gold', itemName: '金币', count: 200, weight: 600, isGrandPrize: false },
                    { id: 'rw_05', itemId: 'starbean', itemName: '星豆', count: 50, weight: 300, isGrandPrize: false },
                    { id: 'rw_06', itemId: 'starbean', itemName: '星豆', count: 100, weight: 200, isGrandPrize: false },
                    { id: 'rw_07', itemId: 'consumable_01', itemName: '经验药水', count: 2, weight: 350, isGrandPrize: false },
                    { id: 'rw_08', itemId: 'consumable_02', itemName: '体力药水', count: 1, weight: 400, isGrandPrize: false },
                    { id: 'rw_09', itemId: 'gold', itemName: '金币', count: 2000, weight: 150, isGrandPrize: false },
                    { id: 'rw_10', itemId: 'skin_02', itemName: '头像框', count: 1, weight: 80, isGrandPrize: false },
                    { id: 'rw_11', itemId: 'starbean', itemName: '星豆', count: 30, weight: 500, isGrandPrize: false },
                    { id: 'rw_12', itemId: 'consumable_03', itemName: '双倍卡', count: 1, weight: 250, isGrandPrize: false },
                    { id: 'rw_13', itemId: 'gold', itemName: '金币', count: 800, weight: 450, isGrandPrize: false },
                    { id: 'rw_14', itemId: 'item_9999', itemName: '升级道具', count: 1, weight: 100, isGrandPrize: false },
                    { id: 'rw_15', itemId: 'starbean', itemName: '星豆', count: 200, weight: 100, isGrandPrize: false },
                ]
            },
            intermediate: {
                type: 'intermediate',
                name: '中级转盘',
                maxRewards: 12,
                grandPrizeId: 'rw_m02',
                rewards: [
                    { id: 'rw_m01', itemId: 'gold', itemName: '金币', count: 3000, weight: 400, isGrandPrize: false },
                    { id: 'rw_m02', itemId: 'skin_03', itemName: '稀有皮肤', count: 1, weight: 15, isGrandPrize: true },
                    { id: 'rw_m03', itemId: 'starbean', itemName: '星豆', count: 200, weight: 300, isGrandPrize: false },
                    { id: 'rw_m04', itemId: 'gold', itemName: '金币', count: 5000, weight: 200, isGrandPrize: false },
                    { id: 'rw_m05', itemId: 'consumable_01', itemName: '经验药水', count: 5, weight: 250, isGrandPrize: false },
                    { id: 'rw_m06', itemId: 'starbean', itemName: '星豆', count: 500, weight: 150, isGrandPrize: false },
                    { id: 'rw_m07', itemId: 'skin_04', itemName: '聊天气泡', count: 1, weight: 100, isGrandPrize: false },
                    { id: 'rw_m08', itemId: 'gold', itemName: '金币', count: 1500, weight: 450, isGrandPrize: false },
                    { id: 'rw_m09', itemId: 'consumable_02', itemName: '体力药水', count: 3, weight: 350, isGrandPrize: false },
                    { id: 'rw_m10', itemId: 'starbean', itemName: '星豆', count: 100, weight: 400, isGrandPrize: false },
                    { id: 'rw_m11', itemId: 'item_9999', itemName: '升级道具', count: 1, weight: 80, isGrandPrize: false },
                    { id: 'rw_m12', itemId: 'consumable_03', itemName: '双倍卡', count: 2, weight: 200, isGrandPrize: false },
                ]
            },
            advanced: {
                type: 'advanced',
                name: '高级转盘',
                maxRewards: 10,
                grandPrizeId: 'rw_a02',
                rewards: [
                    { id: 'rw_a01', itemId: 'gold', itemName: '金币', count: 10000, weight: 300, isGrandPrize: false },
                    { id: 'rw_a02', itemId: 'skin_05', itemName: '传奇服饰', count: 1, weight: 5, isGrandPrize: true },
                    { id: 'rw_a03', itemId: 'starbean', itemName: '星豆', count: 1000, weight: 200, isGrandPrize: false },
                    { id: 'rw_a04', itemId: 'skin_06', itemName: '史诗头像框', count: 1, weight: 30, isGrandPrize: false },
                    { id: 'rw_a05', itemId: 'gold', itemName: '金币', count: 20000, weight: 150, isGrandPrize: false },
                    { id: 'rw_a06', itemId: 'consumable_01', itemName: '经验药水', count: 10, weight: 250, isGrandPrize: false },
                    { id: 'rw_a07', itemId: 'starbean', itemName: '星豆', count: 500, weight: 300, isGrandPrize: false },
                    { id: 'rw_a08', itemId: 'skin_07', itemName: '稀有聊天气泡', count: 1, weight: 50, isGrandPrize: false },
                    { id: 'rw_a09', itemId: 'gold', itemName: '金币', count: 5000, weight: 400, isGrandPrize: false },
                    { id: 'rw_a10', itemId: 'consumable_03', itemName: '双倍卡', count: 5, weight: 200, isGrandPrize: false },
                ]
            },
        }
    },
    {
        id: "ACT_20240101",
        startTime: "2026-01-01 00:00:00",
        endTime: "2026-01-31 23:59:59",
        remarks: "2026年1月春节活动",
        rulesZhCN: "请在此配置简体中文活动规则",
        rulesZhTW: "請在此配置繁體中文活動規則",
        rulesJA: "日本語のイベントルールをここに設定してください",
        lastOperator: "admin_02",
        lastUpdateTime: "2025-12-20 09:15:00",
        wheels: {
            beginner: INITIAL_WHEEL_CONFIG('beginner', '初级转盘', 15),
            intermediate: INITIAL_WHEEL_CONFIG('intermediate', '中级转盘', 12),
            advanced: INITIAL_WHEEL_CONFIG('advanced', '高级转盘', 10),
        }
    }
];

const MOCK_DRAW_RECORDS: DrawRecord[] = Array.from({ length: 20 }).map((_, i) => {
    const drawType = i % 3 === 0 ? 'ten' : 'single';
    const isReward = i % 5 === 0;
    return {
        id: `DRAW_${10000 + i}`,
        userId: `USER_${100 + (i % 5)}`,
        drawTime: `2026-01-0${(i % 9) + 1} 10:${10 + i}:00`,
        drawType,
        cost: drawType === 'ten' ? 10 : 1,
        rewardId: 'item_1001',
        rewardName: isReward ? '稀有装扮' : '星豆',
        rewardCount: isReward ? 1 : 100,
        status: 'success',
        // 十连抽时增加多个奖励
        rewards: drawType === 'ten' ? [
            { rewardName: '星豆', rewardCount: 100 },
            { rewardName: '星豆', rewardCount: 150 },
            { rewardName: '普通皮肤', rewardCount: 1 },
            { rewardName: '星豆', rewardCount: 200 },
            { rewardName: '星豆', rewardCount: 120 },
            { rewardName: '活动道具', rewardCount: 2 },
            { rewardName: '星豆', rewardCount: 180 },
            { rewardName: '星豆', rewardCount: 100 },
            { rewardName: '稀有装扮', rewardCount: 1 },
            { rewardName: '星豆', rewardCount: 150 }
        ] : undefined
    };
});

const MOCK_REWARD_OUTPUTS: RewardOutput[] = [
    { id: 'rp_001', activityId: 'ACT_20231001', wheel: 'beginner', rewardName: '星豆', rewardType: 'currency', quality: 'common', quantity: 3200, date: '2026-01-01' },
    { id: 'rp_002', activityId: 'ACT_20231001', wheel: 'beginner', rewardName: '普通皮肤', rewardType: 'skin', quality: 'fine', quantity: 120, date: '2026-01-01' },
    { id: 'rp_003', activityId: 'ACT_20231001', wheel: 'intermediate', rewardName: '活动道具', rewardType: 'consumable', quality: 'rare', quantity: 540, date: '2026-01-02' },
    { id: 'rp_004', activityId: 'ACT_20240101', wheel: 'advanced', rewardName: '稀有装扮', rewardType: 'skin', quality: 'epic', quantity: 35, date: '2026-01-02' },
    { id: 'rp_005', activityId: 'ACT_20240101', wheel: 'advanced', rewardName: '星豆', rewardType: 'currency', quality: 'common', quantity: 6800, date: '2026-01-03' },
    { id: 'rp_006', activityId: 'ACT_20240101', wheel: 'beginner', rewardName: '星豆', rewardType: 'currency', quality: 'common', quantity: 4200, date: '2026-01-03' },
    { id: 'rp_007', activityId: 'ACT_20240101', wheel: 'intermediate', rewardName: '兑换券', rewardType: 'consumable', quality: 'excellent', quantity: 260, date: '2026-01-04' },
    { id: 'rp_008', activityId: 'ACT_20240101', wheel: 'intermediate', rewardName: '星豆', rewardType: 'currency', quality: 'common', quantity: 5200, date: '2026-01-04' },
    { id: 'rp_009', activityId: 'ACT_20231001', wheel: 'advanced', rewardName: '星豆', rewardType: 'currency', quality: 'common', quantity: 7500, date: '2026-01-05' },
    { id: 'rp_010', activityId: 'ACT_20231001', wheel: 'advanced', rewardName: '稀有装扮', rewardType: 'skin', quality: 'rare', quantity: 28, date: '2026-01-05' },
    { id: 'rp_011', activityId: 'ACT_20231001', wheel: 'beginner', rewardName: '活动道具', rewardType: 'consumable', quality: 'fine', quantity: 310, date: '2026-01-06' },
    { id: 'rp_012', activityId: 'ACT_20240101', wheel: 'advanced', rewardName: '星豆', rewardType: 'currency', quality: 'common', quantity: 6100, date: '2026-01-06' },
    { id: 'rp_013', activityId: 'ACT_20240101', wheel: 'beginner', rewardName: '普通服饰', rewardType: 'clothing', quality: 'common', quantity: 88, date: '2026-01-06' },
    { id: 'rp_014', activityId: 'ACT_20231001', wheel: 'intermediate', rewardName: '星豆', rewardType: 'currency', quality: 'common', quantity: 4350, date: '2026-01-06' },
    { id: 'rp_015', activityId: 'ACT_20231001', wheel: 'intermediate', rewardName: '纪念服饰', rewardType: 'clothing', quality: 'excellent', quantity: 42, date: '2026-01-06' },
    { id: 'rp_016', activityId: 'ACT_20240101', wheel: 'advanced', rewardName: '能量饮料', rewardType: 'consumable', quality: 'legendary', quantity: 180, date: '2026-01-07' },
];

// Components
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white z-50 transform transition-all duration-300 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message}</span>
        </div>
    );
};

const ConfirmModal = ({ isOpen, title, content, onConfirm, onCancel }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-gray-600 mb-6">{content}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">取消</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded">确定</button>
                </div>
            </div>
        </div>
    );
};

/**
 * 1. GENERAL CONFIGURATION MODULE
 */
const GeneralConfigPanel = ({ showToast }: { showToast: (msg: string, type: 'success' | 'error') => void }) => {
    const [config, setConfig] = useState<GeneralConfig>(MOCK_GENERAL_CONFIG);
    const [isDirty, setIsDirty] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const importRef = useRef<HTMLInputElement>(null);

    const handleChange = (field: keyof GeneralConfig, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleSave = () => {
        // Mock check for active activity
        const hasActiveActivity = false; // Simulated
        if (hasActiveActivity) {
            showToast("当前有活动进行中，禁止修改通用配置", "error");
            return;
        }
        setShowConfirm(true);
    };

    const confirmSave = () => {
        // API Call simulation
        setTimeout(() => {
            showToast("通用配置保存成功", "success");
            setIsDirty(false);
            setShowConfirm(false);
        }, 500);
    };

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `general-config-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        importRef.current?.click();
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            setConfig(parsed);
            setIsDirty(true);
            showToast('通用配置导入成功，请保存生效', 'success');
        } catch (err) {
            console.error(err);
            showToast('导入失败，请检查JSON格式', 'error');
        } finally {
            e.target.value = '';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">通用配置</h2>
                    <p className="text-sm text-gray-500 mt-1">控制所有「星豆大转盘」活动的基础规则</p>
                </div>
                <div className="flex items-center gap-3">
                    <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
                    <button
                        onClick={handleExport}
                        className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                    >
                        导出配置
                    </button>
                    <button
                        onClick={handleImportClick}
                        className="px-4 py-2.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors text-sm"
                    >
                        导入配置
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isDirty}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${isDirty ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                        <Save size={18} />
                        保存配置
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Global Switch */}
                <div className="col-span-full bg-blue-50/50 p-6 rounded-xl border border-blue-100 flex items-center justify-between">
                    <div>
                        <span className="block text-lg font-semibold text-gray-800">全局活动开关 (总闸)</span>
                        <span className="text-sm text-gray-500">关闭后，所有前端入口将隐藏，玩家无法参与活动</span>
                    </div>
                    <div
                        onClick={() => handleChange('globalEnabled', !config.globalEnabled)}
                        className={`w-14 h-8 rounded-full cursor-pointer relative transition-colors duration-300 ${config.globalEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transform transition-transform duration-300 ${config.globalEnabled ? 'translate-x-6' : ''}`} />
                    </div>
                </div>

                {/* Props Config */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">道具与消耗</h3>

                    <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">星盘券道具ID</label>
                        <div className="relative">
                            <Ticket className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={config.ticketItemId}
                                onChange={(e) => handleChange('ticketItemId', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">系统将自动读取该ID对应的图标和名称</p>
                    </div>

                    <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">转盘升级道具ID</label>
                        <div className="relative">
                            <ChevronRight className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={config.upgradeItemId}
                                onChange={(e) => handleChange('upgradeItemId', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">玩家抽中该道具时，将自动转动更高一级转盘（仅初级和中级可添加）</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">单抽消耗</label>
                            <input
                                type="number"
                                value={config.singleDrawCost}
                                onChange={(e) => handleChange('singleDrawCost', parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">十连抽消耗</label>
                            <input
                                type="number"
                                value={config.tenDrawCost}
                                onChange={(e) => handleChange('tenDrawCost', parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Exchange Config */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">兑换规则</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">每日兑换上限 (-1为无限)</label>
                        <input
                            type="number"
                            value={config.dailyExchangeLimit}
                            onChange={(e) => handleChange('dailyExchangeLimit', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Purchase Config - full width below */}
                <div className="md:col-span-2 col-span-1 space-y-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">购买配置</h3>
                    <div className="space-y-4 md:space-y-0 md:flex md:gap-6">
                        <div className="md:flex-1 min-w-0">
                            <label className="block text-sm font-medium text-gray-700 mb-1">购买获得内容（可配置多项）</label>
                            <div className="space-y-2">
                                {config.purchaseItems.map((it, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder="道具ID"
                                            value={it.itemId}
                                            onChange={(e) => {
                                                const next = [...config.purchaseItems];
                                                next[idx] = { ...next[idx], itemId: e.target.value };
                                                handleChange('purchaseItems', next);
                                            }}
                                            className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        <input
                                            type="number"
                                            min={1}
                                            placeholder="数量"
                                            value={it.count}
                                            onChange={(e) => {
                                                const val = Math.max(1, parseInt(e.target.value) || 1);
                                                const next = [...config.purchaseItems];
                                                next[idx] = { ...next[idx], count: val };
                                                handleChange('purchaseItems', next);
                                            }}
                                            className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (config.purchaseItems.length <= 1) {
                                                    showToast('至少需要保留一项购买道具', 'error');
                                                    return;
                                                }
                                                const next = config.purchaseItems.filter((_, i) => i !== idx);
                                                handleChange('purchaseItems', next);
                                            }}
                                            disabled={config.purchaseItems.length <= 1}
                                            className={`px-2 py-2 rounded ${config.purchaseItems.length <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
                                        >
                                            删除
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => handleChange('purchaseItems', [...config.purchaseItems, { itemId: '', count: 1 }])}
                                    className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                                >
                                    + 添加道具
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">可配置多个道具条目，每次购买将按下表数量发放</p>
                        </div>
                        <div className="md:w-80 shrink-0 md:self-start">
                            <label className="block text-sm font-medium text-gray-700 mb-1">购买单价(星豆)</label>
                            <div className="relative">
                                <Coins className="absolute left-3 top-2.5 text-yellow-500" size={18} />
                                <input
                                    type="number"
                                    min={0}
                                    value={config.purchasePrice}
                                    onChange={(e) => handleChange('purchasePrice', Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Removed: 活动规则多语言（已移动至转盘配置） */}

            <ConfirmModal
                isOpen={showConfirm}
                title="保存通用配置"
                content="确定要保存当前的通用配置吗？这些更改将立即反映在所有进行中的活动中。"
                onConfirm={confirmSave}
                onCancel={() => setShowConfirm(false)}
            />
        </div>
    );
};

/**
 * 2. ACTIVITY CONFIGURATION MODULE
 */
const ActivityList = ({ onEdit, onCreate, showToast }: { onEdit: (act: ActivityConfig) => void, onCreate: () => void, showToast: (msg: string, type: 'success' | 'error') => void }) => {
    const [statusFilter, setStatusFilter] = useState<'all' | '未开始' | '进行中' | '已结束'>('all');
    const [timeSort, setTimeSort] = useState<'asc' | 'desc'>('desc');
    const [editedActivities, setEditedActivities] = useState<Map<string, ActivityConfig>>(new Map());
    const [localActivities, setLocalActivities] = useState<ActivityConfig[]>([...MOCK_ACTIVITIES]);
    const [showConfirm, setShowConfirm] = useState(false);

    const isDirty = editedActivities.size > 0;

    const handleRemarkChange = (actId: string, newRemark: string) => {
        const original = MOCK_ACTIVITIES.find(a => a.id === actId);
        const current = localActivities.find(a => a.id === actId);
        if (!current || !original) return;

        const updated = { ...current, remarks: newRemark };
        setLocalActivities(prev => prev.map(a => a.id === actId ? updated : a));

        if (newRemark === original.remarks) {
            setEditedActivities(prev => {
                const next = new Map(prev);
                next.delete(actId);
                return next;
            });
        } else {
            setEditedActivities(prev => new Map(prev).set(actId, updated));
        }
    };

    const handleSave = () => {
        if (!isDirty) return;
        setShowConfirm(true);
    };

    const confirmSave = () => {
        // Mock save - in real app would call API
        console.log('Saving edited activities:', Array.from(editedActivities.values()));
        showToast(`已保存 ${editedActivities.size} 项修改`, 'success');
        setEditedActivities(new Map());
        setShowConfirm(false);
    };

    const checkStatus = (start: string, end: string) => {
        const now = new Date();
        const s = new Date(start);
        const e = new Date(end);
        if (now < s) return { label: '未开始', color: 'bg-gray-100 text-gray-600' };
        if (now > e) return { label: '已结束', color: 'bg-red-50 text-red-600' };
        return { label: '进行中', color: 'bg-green-50 text-green-600 animate-pulse' };
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-800">轮盘列表</h2>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                        <label className="text-gray-600">状态筛选:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="all">全部</option>
                            <option value="未开始">未开始</option>
                            <option value="进行中">进行中</option>
                            <option value="已结束">已结束</option>
                        </select>
                    </div>
                    <button onClick={onCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md transition-all">
                        <Plus size={18} />
                        新建轮盘
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isDirty}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-all ${isDirty
                            ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <Save size={18} />
                        保存配置
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">轮盘ID</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">备注</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                                <button
                                    type="button"
                                    onClick={() => setTimeSort(prev => prev === 'asc' ? 'desc' : 'asc')}
                                    className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                                    title={`点击按开始时间${timeSort === 'asc' ? '降序' : '升序'}排序`}
                                >
                                    时间范围
                                    <ArrowUpDown size={14} />
                                    <span className="text-[10px] text-gray-400 uppercase">{timeSort}</span>
                                </button>
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">状态</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">最后操作</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {localActivities
                            .filter(act => statusFilter === 'all' ? true : checkStatus(act.startTime, act.endTime).label === statusFilter)
                            .sort((a, b) => {
                                const sa = new Date(a.startTime).getTime();
                                const sb = new Date(b.startTime).getTime();
                                if (sa === sb) {
                                    const ea = new Date(a.endTime).getTime();
                                    const eb = new Date(b.endTime).getTime();
                                    return timeSort === 'asc' ? ea - eb : eb - ea;
                                }
                                return timeSort === 'asc' ? sa - sb : sb - sa;
                            })
                            .map(act => {
                                const status = checkStatus(act.startTime, act.endTime);
                                const isEdited = editedActivities.has(act.id);
                                return (
                                    <tr key={act.id} className={`transition-colors group ${isEdited ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                                        <td className="px-6 py-4 font-medium text-gray-900">{act.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                            <input
                                                type="text"
                                                value={act.remarks}
                                                onChange={(e) => handleRemarkChange(act.id, e.target.value)}
                                                className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded outline-none bg-transparent"
                                                placeholder="输入备注"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex flex-col">
                                                <span>{act.startTime}</span>
                                                <span className="text-xs text-gray-400 text-center">|</span>
                                                <span>{act.endTime}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div>{act.lastOperator}</div>
                                            <div className="text-xs text-gray-400">{act.lastUpdateTime}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onEdit(act)}
                                                className="font-medium text-sm px-3 py-1 rounded transition-colors text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                            >
                                                {status.label === '已结束' ? '查看' : '编辑配置'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <ConfirmModal
                    title="确认保存配置"
                    message={`确定要保存 ${editedActivities.size} 项活动的配置更改吗？`}
                    onConfirm={confirmSave}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </div>
    );
};

// WheelEditor Component
const WheelEditor: React.FC<{ wheel: WheelConfig; onChange: (wheel: WheelConfig) => void; isReadOnly?: boolean; upgradeItemId?: string }> = ({ wheel, onChange, isReadOnly = false, upgradeItemId = '' }) => {
    // 确保大奖始终排在第一位
    const sortedRewards = [...wheel.rewards].sort((a, b) => {
        if (a.id === wheel.grandPrizeId) return -1;
        if (b.id === wheel.grandPrizeId) return 1;
        return 0;
    });

    const totalWeight = sortedRewards.reduce((sum, r) => sum + r.weight, 0);

    const updateReward = (index: number, field: keyof RewardConfig, value: any) => {
        // 找到原始索引
        const originalIndex = wheel.rewards.findIndex(r => r.id === sortedRewards[index].id);
        const newRewards = [...wheel.rewards];
        newRewards[originalIndex] = { ...newRewards[originalIndex], [field]: value };
        onChange({ ...wheel, rewards: newRewards });
    };

    const addReward = () => {
        if (wheel.rewards.length >= wheel.maxRewards) return;
        const newReward: RewardConfig = {
            id: `new_${Date.now()}`,
            itemId: '',
            itemName: '未配置',
            count: 1,
            weight: 0,
            isGrandPrize: false
        };
        onChange({ ...wheel, rewards: [...wheel.rewards, newReward] });
    };

    const addUpgradeReward = () => {
        if (wheel.rewards.length >= wheel.maxRewards) return;
        // 从通用配置中获取升级道具ID
        const resolvedUpgradeItemId = upgradeItemId || 'item_9999';
        const newReward: RewardConfig = {
            id: `upgrade_${Date.now()}`,
            itemId: resolvedUpgradeItemId,
            itemName: '转盘升级券',
            count: 1,
            weight: 50,
            isGrandPrize: false
        };
        onChange({ ...wheel, rewards: [...wheel.rewards, newReward] });
    };

    const removeReward = (index: number) => {
        const rewardToRemove = sortedRewards[index];
        const newRewards = wheel.rewards.filter(r => r.id !== rewardToRemove.id);
        // If we removed the grand prize, reset grand prize selection
        let newGrandPrizeId = wheel.grandPrizeId;
        if (wheel.grandPrizeId === rewardToRemove.id) {
            newGrandPrizeId = null;
        }
        onChange({ ...wheel, rewards: newRewards, grandPrizeId: newGrandPrizeId });
    };

    const handleGrandPrizeChange = (id: string) => {
        onChange({ ...wheel, grandPrizeId: id });
    };

    const moveRewardUp = (index: number) => {
        if (index === 0 || sortedRewards[index].id === wheel.grandPrizeId) return;
        const originalIndex = wheel.rewards.findIndex(r => r.id === sortedRewards[index].id);
        const prevIndex = wheel.rewards.findIndex(r => r.id === sortedRewards[index - 1].id);

        const newRewards = [...wheel.rewards];
        [newRewards[originalIndex], newRewards[prevIndex]] = [newRewards[prevIndex], newRewards[originalIndex]];
        onChange({ ...wheel, rewards: newRewards });
    };

    const moveRewardDown = (index: number) => {
        if (index === sortedRewards.length - 1 || sortedRewards[index].id === wheel.grandPrizeId) return;
        const originalIndex = wheel.rewards.findIndex(r => r.id === sortedRewards[index].id);
        const nextIndex = wheel.rewards.findIndex(r => r.id === sortedRewards[index + 1].id);

        const newRewards = [...wheel.rewards];
        [newRewards[originalIndex], newRewards[nextIndex]] = [newRewards[nextIndex], newRewards[originalIndex]];
        onChange({ ...wheel, rewards: newRewards });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600">
                    奖励数量: <span className={`font-bold ${wheel.rewards.length === wheel.maxRewards ? 'text-green-600' : 'text-red-600'}`}>{wheel.rewards.length}</span> / {wheel.maxRewards}
                    {wheel.rewards.length !== wheel.maxRewards && (
                        <span className="text-red-500 text-xs ml-2">（必须恰好{wheel.maxRewards}个）</span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                        <span>本转盘大奖:</span>
                        <select
                            value={wheel.grandPrizeId || ''}
                            onChange={(e) => handleGrandPrizeChange(e.target.value)}
                            disabled={isReadOnly}
                            className={`bg-white border border-gray-300 text-sm rounded px-2 py-1 outline-none ${isReadOnly ? 'cursor-not-allowed bg-gray-50' : 'focus:border-blue-500'}`}
                        >
                            <option value="">未选择</option>
                            {wheel.rewards.map(r => (
                                <option key={r.id} value={r.id}>{r.itemName} (x{r.count})</option>
                            ))}
                        </select>
                    </div>
                    {!isReadOnly && (
                        <>
                            <button
                                onClick={addReward}
                                disabled={wheel.rewards.length >= wheel.maxRewards}
                                className={`text-xs px-3 py-1.5 rounded border transition-colors ${wheel.rewards.length >= wheel.maxRewards ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border-blue-600 text-blue-600 hover:bg-blue-50'}`}
                            >
                                + 添加奖励
                            </button>
                            {(wheel.type === 'beginner' || wheel.type === 'intermediate') && (
                                <button
                                    onClick={addUpgradeReward}
                                    disabled={wheel.rewards.length >= wheel.maxRewards}
                                    className={`text-xs px-3 py-1.5 rounded border transition-colors ${wheel.rewards.length >= wheel.maxRewards ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border-green-600 text-green-600 hover:bg-green-50'}`}
                                >
                                    + 添加升级道具
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 border-b">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium w-1/4">道具ID/名称</th>
                            <th className="px-4 py-2 text-center font-medium w-24">数量</th>
                            <th className="px-4 py-2 text-center font-medium w-24">权重</th>
                            <th className="px-4 py-2 text-center font-medium w-24">概率(自动)</th>
                            <th className="px-4 py-2 text-right font-medium w-16">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {sortedRewards.map((reward, idx) => (
                            <tr key={reward.id} className={wheel.grandPrizeId === reward.id ? "bg-yellow-50/50" : ""}>
                                <td className="px-4 py-2">
                                    <div className="flex flex-col">
                                        <input
                                            type="text"
                                            placeholder="道具ID"
                                            value={reward.itemId}
                                            onChange={(e) => updateReward(idx, 'itemId', e.target.value)}
                                            disabled={isReadOnly}
                                            className={`border-b outline-none bg-transparent mb-1 text-xs font-mono text-gray-500 ${isReadOnly ? 'border-transparent cursor-not-allowed' : 'border-transparent focus:border-blue-500'}`}
                                        />
                                        <input
                                            type="text"
                                            placeholder="道具名称(模拟)"
                                            value={reward.itemName}
                                            onChange={(e) => updateReward(idx, 'itemName', e.target.value)}
                                            disabled={isReadOnly}
                                            className={`border-b outline-none bg-transparent font-medium text-gray-800 ${isReadOnly ? 'border-transparent cursor-not-allowed' : 'border-transparent focus:border-blue-500'}`}
                                        />
                                        {wheel.grandPrizeId === reward.id && <span className="text-[10px] text-yellow-600 font-bold uppercase tracking-wider mt-1">👑 大奖</span>}
                                    </div>
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <input
                                        type="number"
                                        value={reward.count}
                                        onChange={(e) => updateReward(idx, 'count', parseInt(e.target.value) || 0)}
                                        disabled={isReadOnly}
                                        className={`w-16 text-center border rounded py-1 outline-none ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'focus:ring-1 focus:ring-blue-500'}`}
                                    />
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <input
                                        type="number"
                                        value={reward.weight}
                                        onChange={(e) => updateReward(idx, 'weight', parseInt(e.target.value) || 0)}
                                        disabled={isReadOnly}
                                        className={`w-16 text-center border rounded py-1 outline-none ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'focus:ring-1 focus:ring-blue-500'}`}
                                    />
                                </td>
                                <td className="px-4 py-2 text-center text-gray-500">
                                    {totalWeight > 0 ? ((reward.weight / totalWeight) * 100).toFixed(2) : 0}%
                                </td>
                                <td className="px-4 py-2 text-right">
                                    {!isReadOnly && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => moveRewardUp(idx)}
                                                disabled={idx === 0 || wheel.grandPrizeId === reward.id}
                                                className={`p-1 rounded ${idx === 0 || wheel.grandPrizeId === reward.id ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-blue-500'}`}
                                                title="上移"
                                            >
                                                ↑
                                            </button>
                                            <button
                                                onClick={() => moveRewardDown(idx)}
                                                disabled={idx === sortedRewards.length - 1 || wheel.grandPrizeId === reward.id}
                                                className={`p-1 rounded ${idx === sortedRewards.length - 1 || wheel.grandPrizeId === reward.id ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-blue-500'}`}
                                                title="下移"
                                            >
                                                ↓
                                            </button>
                                            <button onClick={() => removeReward(idx)} className="text-gray-400 hover:text-red-500">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {sortedRewards.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-400">暂无奖励配置，请点击添加</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ActivityEditor = ({ initialData, onSave, onCancel, showToast, isReadOnly = false }: any) => {
    const [data, setData] = useState<ActivityConfig>(initialData || {
        id: `ACT_${new Date().getFullYear()}${Math.floor(Math.random() * 10000)}`,
        startTime: '',
        endTime: '',
        remarks: '',
        rulesZhCN: '',
        rulesZhTW: '',
        rulesJA: '',
        wheels: {
            beginner: INITIAL_WHEEL_CONFIG('beginner', '初级转盘', 15),
            intermediate: INITIAL_WHEEL_CONFIG('intermediate', '中级转盘', 12),
            advanced: INITIAL_WHEEL_CONFIG('advanced', '高级转盘', 10),
        },
        lastOperator: '当前用户',
        lastUpdateTime: new Date().toISOString()
    });

    const [activeTab, setActiveTab] = useState<WheelType>('beginner');
    const [activeLangTab, setActiveLangTab] = useState<'zh-CN' | 'zh-TW' | 'ja'>('zh-CN');
    const importRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `activity-${data.id}-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        importRef.current?.click();
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            if (!parsed?.wheels) {
                throw new Error('缺少 wheels 字段');
            }
            setData(parsed);
            setActiveTab('beginner');
            setActiveLangTab('zh-CN');
            showToast('活动配置导入成功，请保存生效', 'success');
        } catch (err) {
            console.error(err);
            showToast('导入失败，请检查JSON结构', 'error');
        } finally {
            e.target.value = '';
        }
    };

    const handleSave = () => {
        // Validation: Check overlaps (Mock)
        if (!data.startTime || !data.endTime) {
            showToast("请填写完整的活动时间", "error");
            return;
        }
        // Check Grand Prizes
        if (!data.wheels.beginner.grandPrizeId || !data.wheels.intermediate.grandPrizeId || !data.wheels.advanced.grandPrizeId) {
            showToast("每个转盘都必须指定一个大奖", "error");
            return;
        }

        onSave(data);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">{isReadOnly ? '查看轮盘' : (initialData ? '编辑轮盘' : '新建轮盘')}</h2>
                    <p className="text-xs text-gray-500 font-mono mt-1">轮盘ID: {data.id}{isReadOnly && <span className="ml-2 text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded text-[10px] font-semibold">只读模式</span>}</p>
                </div>
                <div className="flex gap-3 items-center">
                    <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
                    <button
                        onClick={handleExport}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        导出配置
                    </button>
                    <button
                        onClick={handleImportClick}
                        disabled={isReadOnly}
                        className={`px-3 py-2 text-sm border rounded-lg ${isReadOnly ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}
                    >
                        导入配置
                    </button>
                    <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">{isReadOnly ? '关闭' : '取消'}</button>
                    {!isReadOnly && (
                        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
                            <Save size={16} /> 保存配置
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                {/* Time & Remarks Config */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="datetime-local" // Simplified for demo
                                value={data.startTime.replace(' ', 'T')}
                                onChange={(e) => setData({ ...data, startTime: e.target.value.replace('T', ' ') })}
                                disabled={isReadOnly}
                                className={`w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500'}`}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="datetime-local"
                                value={data.endTime.replace(' ', 'T')}
                                onChange={(e) => setData({ ...data, endTime: e.target.value.replace('T', ' ') })}
                                disabled={isReadOnly}
                                className={`w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500'}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Remarks */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-1">活动备注</label>
                    <textarea
                        value={data.remarks}
                        onChange={(e) => setData({ ...data, remarks: e.target.value })}
                        placeholder="输入活动备注，方便阅读和管理"
                        rows={2}
                        disabled={isReadOnly}
                        className={`w-full px-4 py-2 border border-gray-200 rounded-lg outline-none resize-none ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500'}`}
                    />
                    <p className="text-xs text-gray-400 mt-1">可选字段，用于描述活动的目的、规则说明等</p>
                </div>

                {/* Activity Rules in Multiple Languages (moved from General) */}
                <div className="mb-10">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">活动规则 - 多语言配置</h3>

                    {/* Language Tabs */}
                    <div className="mb-6">
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setActiveLangTab('zh-CN')}
                                className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeLangTab === 'zh-CN' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                简体中文
                                {activeLangTab === 'zh-CN' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
                            </button>
                            <button
                                onClick={() => setActiveLangTab('zh-TW')}
                                className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeLangTab === 'zh-TW' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                繁体中文
                                {activeLangTab === 'zh-TW' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
                            </button>
                            <button
                                onClick={() => setActiveLangTab('ja')}
                                className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeLangTab === 'ja' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                日本語
                                {activeLangTab === 'ja' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
                            </button>
                        </div>
                    </div>

                    {/* Language Content */}
                    <div className="bg-white">
                        {activeLangTab === 'zh-CN' && (
                            <textarea
                                value={data.rulesZhCN}
                                onChange={(e) => setData({ ...data, rulesZhCN: e.target.value })}
                                placeholder="输入活动规则（简体中文）"
                                rows={5}
                                disabled={isReadOnly}
                                className={`w-full px-4 py-3 border border-gray-200 rounded-lg outline-none resize-none ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500'}`}
                            />
                        )}
                        {activeLangTab === 'zh-TW' && (
                            <textarea
                                value={data.rulesZhTW}
                                onChange={(e) => setData({ ...data, rulesZhTW: e.target.value })}
                                placeholder="輸入活動規則（繁體中文）"
                                rows={5}
                                disabled={isReadOnly}
                                className={`w-full px-4 py-3 border border-gray-200 rounded-lg outline-none resize-none ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500'}`}
                            />
                        )}
                        {activeLangTab === 'ja' && (
                            <textarea
                                value={data.rulesJA}
                                onChange={(e) => setData({ ...data, rulesJA: e.target.value })}
                                placeholder="アクティビティルール（日本語）を入力してください"
                                rows={5}
                                disabled={isReadOnly}
                                className={`w-full px-4 py-3 border border-gray-200 rounded-lg outline-none resize-none ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500'}`}
                            />
                        )}
                    </div>
                </div>

                {/* Wheel Tabs */}
                <div className="mb-6">
                    <div className="flex border-b border-gray-200">
                        {(['beginner', 'intermediate', 'advanced'] as WheelType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setActiveTab(type)}
                                className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === type ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {data.wheels[type].name}
                                {activeTab === type && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Active Wheel Editor */}
                <div className="bg-white">
                    <WheelEditor
                        wheel={data.wheels[activeTab]}
                        onChange={(updatedWheel) => setData({
                            ...data,
                            wheels: { ...data.wheels, [activeTab]: updatedWheel }
                        })}
                        isReadOnly={isReadOnly}
                        upgradeItemId={MOCK_GENERAL_CONFIG.upgradeItemId}
                    />
                </div>
            </div>
        </div>
    );
};

/**
 * 3. DATA QUERY MODULE
 */
const DataQueryPanel = () => {
    const [showRewardModal, setShowRewardModal] = useState<{ drawId: string; rewards: Array<{ rewardName: string; rewardCount: number }> } | null>(null);
    const [selectedUserData, setSelectedUserData] = useState<string | null>(null);
    const [filterUserId, setFilterUserId] = useState('');
    const [filterItemId, setFilterItemId] = useState('');
    const [filterDrawType, setFilterDrawType] = useState<'all' | 'single' | 'ten'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');

    // 筛选记录
    const filteredRecords = MOCK_DRAW_RECORDS.filter(r => {
        if (filterUserId && !r.userId.toLowerCase().includes(filterUserId.toLowerCase())) return false;
        if (filterDrawType !== 'all' && r.drawType !== filterDrawType) return false;
        if (filterStatus !== 'all' && r.status !== filterStatus) return false;
        if (filterItemId) {
            const itemMatch = r.rewardName.toLowerCase().includes(filterItemId.toLowerCase()) ||
                r.rewardId.toLowerCase().includes(filterItemId.toLowerCase()) ||
                (r.rewards && r.rewards.some(rew => rew.rewardName.toLowerCase().includes(filterItemId.toLowerCase())));
            if (!itemMatch) return false;
        }
        return true;
    });

    // 计算玩家聚合数据
    const getUserStats = (userId: string) => {
        const userRecords = MOCK_DRAW_RECORDS.filter(r => r.userId === userId);
        const totalDraws = userRecords.length;
        const totalCost = userRecords.reduce((sum, r) => sum + r.cost, 0);
        const totalRewards = userRecords.reduce((sum, r) => {
            if (r.rewards) {
                return sum + r.rewards.reduce((s, rew) => s + rew.rewardCount, 0);
            }
            return sum + r.rewardCount;
        }, 0);
        const tenDrawCount = userRecords.filter(r => r.drawType === 'ten').length;
        const singleDrawCount = userRecords.filter(r => r.drawType === 'single').length;

        return {
            userId,
            totalDraws,
            totalCost,
            totalRewards,
            tenDrawCount,
            singleDrawCount,
            records: userRecords
        };
    };
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Search size={20} className="text-blue-600" />
                    数据查询
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">玩家ID</label>
                        <input type="text" placeholder="输入ID精确查找" value={filterUserId} onChange={e => setFilterUserId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">道具ID/名称</label>
                        <input type="text" placeholder="输入道具ID或名称" value={filterItemId} onChange={e => setFilterItemId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">日期范围</label>
                        <input type="date" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">抽奖类型</label>
                        <select value={filterDrawType} onChange={e => setFilterDrawType(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                            <option value="all">全部</option>
                            <option value="single">单抽</option>
                            <option value="ten">十连抽</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">状态</label>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                            <option value="all">全部</option>
                            <option value="success">成功</option>
                            <option value="failed">失败</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                            查询
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3 font-semibold text-gray-500">抽奖ID</th>
                            <th className="px-6 py-3 font-semibold text-gray-500">玩家ID</th>
                            <th className="px-6 py-3 font-semibold text-gray-500">时间</th>
                            <th className="px-6 py-3 font-semibold text-gray-500">类型</th>
                            <th className="px-6 py-3 font-semibold text-gray-500">消耗星盘券</th>
                            <th className="px-6 py-3 font-semibold text-gray-500">获得奖励</th>
                            <th className="px-6 py-3 font-semibold text-gray-500">状态</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredRecords.map(record => (
                            <tr key={record.id} className="hover:bg-gray-50">
                                <td className="px-6 py-3 font-mono text-xs text-gray-400">{record.id}</td>
                                <td className="px-6 py-3">
                                    <button
                                        onClick={() => setSelectedUserData(record.userId)}
                                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                    >
                                        {record.userId}
                                    </button>
                                </td>
                                <td className="px-6 py-3 text-gray-600">{record.drawTime}</td>
                                <td className="px-6 py-3">
                                    <span className={`px-2 py-0.5 rounded text-xs ${record.drawType === 'ten' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {record.drawType === 'ten' ? '十连抽' : '单抽'}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-gray-600">{record.cost}</td>
                                <td className="px-6 py-3">
                                    {record.drawType === 'ten' && record.rewards ? (
                                        <button
                                            onClick={() => setShowRewardModal({ drawId: record.id, rewards: record.rewards! })}
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                                        >
                                            <Gift size={14} className="text-gray-400" />
                                            <span>10件奖励</span>
                                            <span className="text-gray-400 text-xs">点击查看</span>
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Gift size={14} className="text-gray-400" />
                                            <span>{record.rewardName}</span>
                                            <span className="text-gray-400 text-xs">x{record.rewardCount}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-3">
                                    <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                        <CheckCircle size={12} /> 成功
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                    <span>显示 1-{filteredRecords.length} 条，共 {filteredRecords.length} 条</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border rounded hover:bg-gray-50">上一页</button>
                        <button className="px-3 py-1 border rounded hover:bg-gray-50">下一页</button>
                    </div>
                </div>
            </div>

            {/* Reward Modal */}
            {showRewardModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">十连抽奖励详情</h3>
                            <button
                                onClick={() => setShowRewardModal(null)}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {showRewardModal.rewards.map((reward, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Gift size={16} className="text-blue-600" />
                                        <div>
                                            <div className="font-medium text-gray-800">{reward.rewardName}</div>
                                            <div className="text-xs text-gray-500">第{idx + 1}件</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-semibold text-gray-700">×{reward.rewardCount}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => setShowRewardModal(null)}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                            >
                                关闭
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Data Modal */}
            {selectedUserData && (() => {
                const userStats = getUserStats(selectedUserData);
                return (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl max-h-96 overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800">玩家数据详情</h3>
                                <button
                                    onClick={() => setSelectedUserData(null)}
                                    className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* User Stats Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <div className="text-sm text-gray-600 mb-1">玩家ID</div>
                                    <div className="text-lg font-bold text-blue-600">{userStats.userId}</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                    <div className="text-sm text-gray-600 mb-1">总参与次数</div>
                                    <div className="text-lg font-bold text-green-600">{userStats.totalDraws}</div>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                                    <div className="text-sm text-gray-600 mb-1">消耗总额</div>
                                    <div className="text-lg font-bold text-orange-600">{userStats.totalCost}</div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                                    <div className="text-sm text-gray-600 mb-1">获得奖励数</div>
                                    <div className="text-lg font-bold text-purple-600">{userStats.totalRewards}</div>
                                </div>
                            </div>

                            {/* Draw Type Breakdown */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-gray-800 mb-3">抽奖类型统计</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">单抽次数:</span>
                                        <span className="font-bold text-blue-600">{userStats.singleDrawCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">十连抽次数:</span>
                                        <span className="font-bold text-purple-600">{userStats.tenDrawCount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Draws */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-800 mb-3">近期抽奖记录</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {userStats.records.slice(0, 10).map((record, idx) => (
                                        <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="text-xs text-gray-400 w-8">#{idx + 1}</span>
                                                <span className="text-xs text-gray-600">{record.drawTime}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded ${record.drawType === 'ten' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {record.drawType === 'ten' ? '十连抽' : '单抽'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600">消耗: {record.cost}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex gap-3">
                                <button
                                    onClick={() => setSelectedUserData(null)}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                >
                                    关闭
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

/**
 * 4. STATISTICS MODULE
 */
const StatisticsPanel = () => {
    const [selectedWheelId, setSelectedWheelId] = useState<string>('all');
    const [showRewardModal, setShowRewardModal] = useState(false);
    const [trendTimeRange, setTrendTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
    const [viewMode, setViewMode] = useState<'activity' | 'reward'>('activity');
    const [expandedDetail, setExpandedDetail] = useState<{ activityId: string; type: RewardType } | null>(null);
    const [selectedTypes, setSelectedTypes] = useState<RewardType[]>(['currency', 'skin', 'clothing', 'consumable']);
    const [selectedQualities, setSelectedQualities] = useState<RewardQuality[]>(['common', 'fine', 'rare', 'excellent', 'epic', 'legendary']);

    const filteredOutputs = MOCK_REWARD_OUTPUTS.filter(item => {
        const matchActivity = selectedWheelId === 'all' || item.activityId === selectedWheelId;
        const matchType = selectedTypes.includes(item.rewardType);
        const matchQuality = selectedQualities.includes(item.quality);
        return matchActivity && matchType && matchQuality;
    });

    const toggleType = (type: RewardType) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const toggleQuality = (quality: RewardQuality) => {
        setSelectedQualities(prev =>
            prev.includes(quality) ? prev.filter(q => q !== quality) : [...prev, quality]
        );
    };

    // 新增：按来源（初级/中级/高级）分布
    const distributionBySource = (['beginner', 'intermediate', 'advanced'] as WheelType[]).map(w => {
        const amount = filteredOutputs
            .filter(item => item.wheel === w)
            .reduce((sum, item) => sum + item.quantity, 0);
        return { source: w, amount };
    });
    const wheelLabel: Record<WheelType, string> = {
        beginner: '初级',
        intermediate: '中级',
        advanced: '高级'
    };

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">筛选轮盘:</label>
                    <select
                        value={selectedWheelId}
                        onChange={(e) => setSelectedWheelId(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                        <option value="all">全部轮盘</option>
                        {MOCK_ACTIVITIES.map(act => (
                            <option key={act.id} value={act.id}>
                                {act.remarks || act.id}
                            </option>
                        ))}
                    </select>
                    <div className="text-xs text-gray-500 ml-auto">
                        当前选择: {selectedWheelId === 'all' ? '全部轮盘' : MOCK_ACTIVITIES.find(a => a.id === selectedWheelId)?.remarks || selectedWheelId}
                    </div>
                </div>

                {/* 奖励类型筛选 */}
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">奖励类型:</label>
                    <div className="flex gap-3">
                        {[
                            { value: 'currency', label: '货币', color: 'blue' },
                            { value: 'skin', label: '装扮', color: 'purple' },
                            { value: 'clothing', label: '服饰', color: 'pink' },
                            { value: 'consumable', label: '消耗品', color: 'yellow' }
                        ].map(type => (
                            <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedTypes.includes(type.value as RewardType)}
                                    onChange={() => toggleType(type.value as RewardType)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className={`text-sm px-2 py-1 rounded bg-${type.color}-100 text-${type.color}-700`}>
                                    {type.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 品质筛选 */}
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">奖励品质:</label>
                    <div className="flex gap-3 flex-wrap">
                        {[
                            { value: 'common', label: '普通', color: 'gray' },
                            { value: 'fine', label: '精良', color: 'green' },
                            { value: 'rare', label: '稀有', color: 'blue' },
                            { value: 'excellent', label: '优秀', color: 'indigo' },
                            { value: 'epic', label: '史诗', color: 'purple' },
                            { value: 'legendary', label: '传奇', color: 'orange' }
                        ].map(quality => (
                            <label key={quality.value} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedQualities.includes(quality.value as RewardQuality)}
                                    onChange={() => toggleQuality(quality.value as RewardQuality)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className={`text-sm px-2 py-1 rounded bg-${quality.color}-100 text-${quality.color}-700 font-medium`}>
                                    {quality.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">总参与次数</div>
                    <div className="text-2xl font-bold text-gray-800">{selectedWheelId === 'all' ? '45,231' : '12,453'}</div>
                    <div className="text-xs text-green-500 mt-2 flex items-center">
                        <span className="bg-green-100 px-1.5 py-0.5 rounded mr-1">↑ 12%</span> 较昨日
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">消耗星盘券</div>
                    <div className="text-2xl font-bold text-gray-800">{selectedWheelId === 'all' ? '128,900' : '34,200'}</div>
                    <div className="text-xs text-blue-500 mt-2 flex items-center">
                        <span className="bg-blue-100 px-1.5 py-0.5 rounded mr-1">-</span> 平均 2.8/人
                    </div>
                </div>
                <div
                    className="text-left bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
                >
                    <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                        <span>奖励发放数</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{selectedWheelId === 'all' ? '512,040' : '156,320'}</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">星豆回收量</div>
                    <div className="text-2xl font-bold text-yellow-600">{selectedWheelId === 'all' ? '8,900,000' : '2,345,600'}</div>
                </div>
            </div>

            {/* 奖励分布图表 - 类型和来源 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Simulated Chart 2 - 动态奖励类型分布 */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[300px]">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">奖励类型分布</h3>
                    {(() => {
                        const typeDistribution = (['currency', 'skin', 'clothing', 'consumable'] as RewardType[]).map(type => {
                            const amount = filteredOutputs
                                .filter(item => item.rewardType === type)
                                .reduce((sum, item) => sum + item.quantity, 0);
                            return { type, amount };
                        });
                        const total = typeDistribution.reduce((sum, item) => sum + item.amount, 0);
                        const colors: Record<RewardType, string> = {
                            currency: '#3b82f6',
                            skin: '#a855f7',
                            clothing: '#ec4899',
                            consumable: '#facc15'
                        };
                        const colorClasses: Record<RewardType, string> = {
                            currency: 'bg-blue-500',
                            skin: 'bg-purple-500',
                            clothing: 'bg-pink-500',
                            consumable: 'bg-yellow-400'
                        };
                        const typeLabels: Record<RewardType, string> = {
                            currency: '货币',
                            skin: '装扮',
                            clothing: '服饰',
                            consumable: '消耗品'
                        };
                        let offset = 0;
                        const circumference = 251.2;

                        return (
                            <div className="flex items-center justify-center h-48 gap-12">
                                {total > 0 ? (
                                    <>
                                        <svg className="w-32 h-32" viewBox="0 0 100 100">
                                            {typeDistribution.map((item) => {
                                                if (item.amount === 0) return null;
                                                const percentage = (item.amount / total) * 100;
                                                const dasharray = (percentage / 100) * circumference;
                                                const currentOffset = offset;
                                                offset += dasharray;

                                                return (
                                                    <circle
                                                        key={item.type}
                                                        cx="50"
                                                        cy="50"
                                                        r="40"
                                                        fill="none"
                                                        stroke={colors[item.type]}
                                                        strokeWidth="20"
                                                        strokeDasharray={`${dasharray} ${circumference}`}
                                                        strokeDashoffset={`-${currentOffset}`}
                                                        transform="rotate(-90 50 50)"
                                                    />
                                                );
                                            })}
                                            <circle cx="50" cy="50" r="20" fill="white" />
                                            <text x="50" y="55" textAnchor="middle" className="text-xs font-bold fill-gray-700">
                                                100%
                                            </text>
                                        </svg>

                                        <div className="space-y-3">
                                            {typeDistribution.map((item) => {
                                                if (item.amount === 0) return null;
                                                const percentage = ((item.amount / total) * 100).toFixed(1);
                                                return (
                                                    <div key={item.type} className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 ${colorClasses[item.type]} rounded-full flex-shrink-0`}></div>
                                                        <span className="text-sm text-gray-600">{typeLabels[item.type]} <span className="font-semibold">{percentage}%</span></span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-gray-400 text-sm">暂无数据</div>
                                )}
                            </div>
                        );
                    })()}
                </div>

                {/* 新增图表：奖励来源分布（初级/中级/高级） */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[300px]">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">奖励来源分布</h3>
                    <div className="flex items-center justify-center h-48 gap-12">
                        {/* Pie Chart */}
                        {(() => {
                            const total = distributionBySource.reduce((sum, item) => sum + item.amount, 0);
                            const colors = ['#10b981', '#8b5cf6', '#ec4899']; // emerald, purple, pink
                            let offset = 0;
                            const circumference = 251.2; // 2 * π * 40

                            return (
                                <svg className="w-32 h-32" viewBox="0 0 100 100">
                                    {distributionBySource.map((item, idx) => {
                                        const percentage = total > 0 ? (item.amount / total) * 100 : 0;
                                        const dasharray = (percentage / 100) * circumference;
                                        const currentOffset = offset;
                                        offset += dasharray;

                                        return (
                                            <circle
                                                key={item.source}
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="none"
                                                stroke={colors[idx]}
                                                strokeWidth="20"
                                                strokeDasharray={`${dasharray} ${circumference}`}
                                                strokeDashoffset={`-${currentOffset}`}
                                                transform="rotate(-90 50 50)"
                                            />
                                        );
                                    })}
                                    {/* Center circle for donut */}
                                    <circle cx="50" cy="50" r="20" fill="white" />
                                    <text x="50" y="55" textAnchor="middle" className="text-xs font-bold fill-gray-700">
                                        100%
                                    </text>
                                </svg>
                            );
                        })()}

                        {/* Legend */}
                        <div className="space-y-3">
                            {(() => {
                                const total = distributionBySource.reduce((sum, item) => sum + item.amount, 0);
                                const colors = ['bg-emerald-500', 'bg-purple-500', 'bg-pink-500'];
                                return distributionBySource.map((item, idx) => {
                                    const percentage = total > 0 ? ((item.amount / total) * 100).toFixed(1) : '0';
                                    return (
                                        <div key={item.source} className="flex items-center gap-3">
                                            <div className={`w-3 h-3 ${colors[idx]} rounded-full flex-shrink-0`}></div>
                                            <span className="text-sm text-gray-600">{wheelLabel[item.source]} <span className="font-semibold">{percentage}%</span></span>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            {/* 参与趋势图表 - 独立一行 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-800">参与趋势 {selectedWheelId !== 'all' && `- ${selectedWheelId}`}</h3>
                    <div className="flex gap-2">
                        {[
                            { value: '7d', label: '7天' },
                            { value: '30d', label: '30天' },
                            { value: '90d', label: '90天' }
                        ].map(option => (
                            <button
                                key={option.value}
                                onClick={() => setTrendTimeRange(option.value as '7d' | '30d' | '90d')}
                                className={`px-3 py-1 text-xs rounded-full transition ${trendTimeRange === option.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {(() => {
                    // 不同时间范围的数据
                    const trendData = {
                        '7d': [
                            { date: '01-01', count: 8420 },
                            { date: '01-02', count: 9830 },
                            { date: '01-03', count: 7560 },
                            { date: '01-04', count: 12340 },
                            { date: '01-05', count: 10580 },
                            { date: '01-06', count: 15230 },
                            { date: '01-07', count: 11940 }
                        ],
                        '30d': [
                            { date: '12-09', count: 5420 },
                            { date: '12-12', count: 6830 },
                            { date: '12-15', count: 7560 },
                            { date: '12-18', count: 9340 },
                            { date: '12-21', count: 11580 },
                            { date: '12-24', count: 13230 },
                            { date: '12-27', count: 14940 },
                            { date: '12-30', count: 12340 }
                        ],
                        '90d': [
                            { date: '10-11', count: 4200 },
                            { date: '10-31', count: 6500 },
                            { date: '11-20', count: 8900 },
                            { date: '12-10', count: 11200 },
                            { date: '12-30', count: 13800 }
                        ]
                    };

                    const data = trendData[trendTimeRange];
                    const maxCount = Math.max(...data.map(d => d.count));
                    const chartHeight = 240;
                    const chartWidth = 600;
                    const paddingX = 30;
                    const paddingY = 20;

                    // 计算SVG坐标
                    const points = data.map((item, i) => {
                        const x = paddingX + (i / (data.length - 1)) * (chartWidth - paddingX * 2);
                        const y = chartHeight - paddingY - (item.count / maxCount) * (chartHeight - paddingY * 2);
                        return { x, y, ...item };
                    });

                    // 生成路径字符串
                    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                    return (
                        <div className="relative">
                            <svg
                                width="100%"
                                height="280"
                                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                preserveAspectRatio="xMidYMid meet"
                                className="overflow-visible"
                            >
                                {/* Grid lines */}
                                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                                    const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
                                    return (
                                        <g key={`grid-${i}`}>
                                            <line
                                                x1={paddingX}
                                                y1={y}
                                                x2={chartWidth - paddingX}
                                                y2={y}
                                                stroke="#e5e7eb"
                                                strokeWidth="1"
                                            />
                                            <text
                                                x={paddingX - 10}
                                                y={y + 4}
                                                textAnchor="end"
                                                className="text-xs fill-gray-500"
                                            >
                                                {Math.round(ratio * maxCount).toLocaleString()}
                                            </text>
                                        </g>
                                    );
                                })}

                                {/* Axes */}
                                <line
                                    x1={paddingX}
                                    y1={paddingY}
                                    x2={paddingX}
                                    y2={chartHeight - paddingY}
                                    stroke="#d1d5db"
                                    strokeWidth="2"
                                />
                                <line
                                    x1={paddingX}
                                    y1={chartHeight - paddingY}
                                    x2={chartWidth - paddingX}
                                    y2={chartHeight - paddingY}
                                    stroke="#d1d5db"
                                    strokeWidth="2"
                                />

                                {/* Line path with gradient */}
                                <defs>
                                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                                        <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                                    </linearGradient>
                                </defs>

                                {/* Fill under line */}
                                <path
                                    d={`${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${paddingX} ${chartHeight - paddingY} Z`}
                                    fill="url(#lineGradient)"
                                />

                                {/* Line */}
                                <path
                                    d={pathD}
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {/* Points */}
                                {points.map((point, i) => (
                                    <g key={`point-${i}`} className="group">
                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r="4"
                                            fill="white"
                                            stroke="#3b82f6"
                                            strokeWidth="2"
                                            className="cursor-pointer hover:r-5 transition-all"
                                        />
                                        <text
                                            x={point.x}
                                            y={chartHeight - 5}
                                            textAnchor="middle"
                                            className="text-xs fill-gray-500"
                                        >
                                            {point.date}
                                        </text>
                                        {/* Tooltip */}
                                        <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <rect
                                                x={point.x - 35}
                                                y={point.y - 25}
                                                width="70"
                                                height="20"
                                                fill="#1f2937"
                                                rx="4"
                                            />
                                            <text
                                                x={point.x}
                                                y={point.y - 10}
                                                textAnchor="middle"
                                                className="text-xs fill-white font-semibold"
                                            >
                                                {point.count.toLocaleString()}
                                            </text>
                                        </g>
                                    </g>
                                ))}
                            </svg>
                        </div>
                    );
                })()}

                <div className="mt-4 text-xs text-gray-400 text-center">数据更新时间：{new Date().toLocaleString('zh-CN')}</div>
            </div>

            {showRewardModal && (() => {
                // 按活动聚合数据
                const byActivity = MOCK_ACTIVITIES.map(activity => {
                    const activityRewards = MOCK_REWARD_OUTPUTS.filter(r => r.activityId === activity.id);
                    const totalQty = activityRewards.reduce((sum, r) => sum + r.quantity, 0);

                    // 按类型统计
                    const byType: Record<RewardType, number> = {
                        currency: 0,
                        skin: 0,
                        clothing: 0,
                        consumable: 0
                    };
                    activityRewards.forEach(r => {
                        byType[r.rewardType] += r.quantity;
                    });

                    return {
                        id: activity.id,
                        name: activity.remarks || activity.id,
                        total: totalQty,
                        byType
                    };
                });

                // 按奖励聚合数据
                const byReward = MOCK_REWARD_OUTPUTS.reduce((acc, item) => {
                    const existing = acc.find(r => r.name === item.rewardName);
                    if (existing) {
                        existing.total += item.quantity;
                        existing.times += 1;
                    } else {
                        acc.push({
                            name: item.rewardName,
                            type: item.rewardType,
                            total: item.quantity,
                            times: 1
                        });
                    }
                    return acc;
                }, [] as Array<{ name: string; type: RewardType; total: number; times: number }>);

                const rewardTypeLabel: Record<RewardType, string> = {
                    currency: '货币',
                    skin: '装扮',
                    clothing: '服饰',
                    consumable: '消耗品'
                };

                const typeColors: Record<RewardType, string> = {
                    currency: 'bg-yellow-100 text-yellow-700',
                    skin: 'bg-purple-100 text-purple-700',
                    clothing: 'bg-pink-100 text-pink-700',
                    consumable: 'bg-blue-100 text-blue-700'
                };

                return (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                            {/* 头部 */}
                            <div className="flex items-center justify-between p-6 border-b">
                                <h2 className="text-xl font-bold text-gray-900">奖励发放统计</h2>
                                <button
                                    onClick={() => setShowRewardModal(false)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* 标签页切换 */}
                            <div className="flex border-b px-6">
                                <button
                                    onClick={() => setViewMode('activity')}
                                    className={`px-4 py-3 text-sm font-medium border-b-2 transition ${viewMode === 'activity'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    按活动查看
                                </button>
                                <button
                                    onClick={() => setViewMode('reward')}
                                    className={`px-4 py-3 text-sm font-medium border-b-2 transition ${viewMode === 'reward'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    按道具查看
                                </button>
                            </div>

                            {/* 内容区域 */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {viewMode === 'activity' ? (
                                    <div className="space-y-4">
                                        <div className="text-sm text-gray-500 mb-4">
                                            显示各活动的奖励发放情况及类型分布 · 点击类型标签查看详情
                                        </div>
                                        {byActivity.map(activity => {
                                            const activityRewards = MOCK_REWARD_OUTPUTS.filter(r => r.activityId === activity.id);

                                            return (
                                                <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">{activity.name}</h3>
                                                            <p className="text-sm text-gray-500 mt-1">总发放: <span className="font-bold text-blue-600">{activity.total}</span> 个</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 flex-wrap">
                                                        {(Object.keys(activity.byType) as RewardType[]).map(type => (
                                                            activity.byType[type] > 0 && (
                                                                <button
                                                                    key={type}
                                                                    onClick={() => {
                                                                        if (expandedDetail?.activityId === activity.id && expandedDetail?.type === type) {
                                                                            setExpandedDetail(null);
                                                                        } else {
                                                                            setExpandedDetail({ activityId: activity.id, type });
                                                                        }
                                                                    }}
                                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${typeColors[type]} hover:opacity-80 transition cursor-pointer ${expandedDetail?.activityId === activity.id && expandedDetail?.type === type ? 'ring-2 ring-offset-1 ring-blue-500' : ''
                                                                        }`}
                                                                >
                                                                    {rewardTypeLabel[type]}: {activity.byType[type]}
                                                                    {expandedDetail?.activityId === activity.id && expandedDetail?.type === type ? ' ▼' : ' ▶'}
                                                                </button>
                                                            )
                                                        ))}
                                                    </div>

                                                    {/* 展开的详情 */}
                                                    {expandedDetail?.activityId === activity.id && (
                                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                                            <div className="text-xs font-medium text-gray-600 mb-2">
                                                                {rewardTypeLabel[expandedDetail.type]} 详细列表
                                                            </div>
                                                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                                                {activityRewards
                                                                    .filter(r => r.rewardType === expandedDetail.type)
                                                                    .map((reward, idx) => (
                                                                        <div key={idx} className="flex items-center justify-between text-sm">
                                                                            <span className="text-gray-700">{reward.rewardName}</span>
                                                                            <div className="flex items-center gap-3">
                                                                                <span className="text-xs text-gray-500">
                                                                                    {reward.wheel === 'beginner' ? '初级' : reward.wheel === 'intermediate' ? '中级' : '高级'}轮盘
                                                                                </span>
                                                                                <span className="font-semibold text-blue-600">{reward.quantity}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-sm text-gray-500 mb-4">
                                            显示各道具的累计发放数量和次数
                                        </div>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left font-medium text-gray-600">道具名称</th>
                                                        <th className="px-4 py-3 text-left font-medium text-gray-600">类型</th>
                                                        <th className="px-4 py-3 text-right font-medium text-gray-600">发放次数</th>
                                                        <th className="px-4 py-3 text-right font-medium text-gray-600">总数量</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {byReward.map((reward, idx) => (
                                                        <tr key={idx} className="hover:bg-blue-50">
                                                            <td className="px-4 py-3 font-medium text-gray-900">{reward.name}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`inline-block px-2 py-1 rounded text-xs ${typeColors[reward.type]}`}>
                                                                    {rewardTypeLabel[reward.type]}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-gray-600">{reward.times}</td>
                                                            <td className="px-4 py-3 text-right font-semibold text-blue-600">{reward.total}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()
            }
        </div >
    )
}

/**
 * MAIN APP
 */
export default function App() {
    const [activeView, setActiveView] = useState<'general' | 'activity' | 'query' | 'stats'>('general');
    const [editingActivity, setEditingActivity] = useState<ActivityConfig | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
    };

    const handleEditActivity = (act: ActivityConfig) => {
        setEditingActivity(act);
        setIsCreating(false);
    };

    const handleCreateActivity = () => {
        setEditingActivity(null);
        setIsCreating(true);
    };

    const handleSaveActivity = (act: ActivityConfig) => {
        // 校验各转盘奖励数量必须精确匹配
        const wheelChecks = [
            { key: 'beginner', name: '初级转盘', required: 15 },
            { key: 'intermediate', name: '中级转盘', required: 12 },
            { key: 'advanced', name: '高级转盘', required: 10 },
        ] as const;
        for (const check of wheelChecks) {
            const actual = act.wheels[check.key].rewards.length;
            if (actual !== check.required) {
                showToast(`${check.name}奖励数量必须为${check.required}个，当前为${actual}个`, 'error');
                return;
            }
        }
        showToast(isCreating ? "轮盘创建成功" : "轮盘配置已更新", "success");
        setEditingActivity(null);
        setIsCreating(false);
        setActiveView('activity');
    };

    // Render content based on state
    const renderContent = () => {
        if (isCreating || editingActivity) {
            // Check if activity has ended
            const isReadOnly = editingActivity ? new Date() > new Date(editingActivity.endTime) : false;

            return (
                <ActivityEditor
                    initialData={editingActivity}
                    onSave={handleSaveActivity}
                    onCancel={() => { setIsCreating(false); setEditingActivity(null); }}
                    showToast={showToast}
                    isReadOnly={isReadOnly}
                />
            );
        }

        switch (activeView) {
            case 'general': return <GeneralConfigPanel showToast={showToast} />;
            case 'activity': return <ActivityList onEdit={handleEditActivity} onCreate={handleCreateActivity} showToast={showToast} />;
            case 'query': return <DataQueryPanel />;
            case 'stats': return <StatisticsPanel />;
            default: return <div>Select a menu item</div>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">★</div>
                        <div>
                            <h1 className="font-bold text-lg tracking-wide">互动管理后台</h1>
                            <p className="text-xs text-slate-400">星豆大转盘 v1.1</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {/* Level 1 Menu - 星豆大转盘 */}
                    <div className="pt-2 pb-4">
                        <div className="px-4 py-2 text-slate-400 text-sm font-semibold uppercase tracking-wider">
                            星豆大转盘
                        </div>
                        {/* Level 2 Menu Items */}
                        <div className="space-y-1 mt-2">
                            <button
                                onClick={() => { setActiveView('general'); setIsCreating(false); setEditingActivity(null); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ml-2 border-l-2 ${activeView === 'general' ? 'bg-blue-600 text-white shadow-lg border-blue-400' : 'text-slate-300 hover:bg-slate-800 border-transparent hover:border-slate-600'}`}
                            >
                                <Settings size={18} />
                                <span className="font-medium">通用配置</span>
                            </button>
                            <button
                                onClick={() => { setActiveView('activity'); setIsCreating(false); setEditingActivity(null); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ml-2 border-l-2 ${activeView === 'activity' ? 'bg-blue-600 text-white shadow-lg border-blue-400' : 'text-slate-300 hover:bg-slate-800 border-transparent hover:border-slate-600'}`}
                            >
                                <Calendar size={18} />
                                <span className="font-medium">轮盘配置</span>
                            </button>
                            <button
                                onClick={() => { setActiveView('query'); setIsCreating(false); setEditingActivity(null); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ml-2 border-l-2 ${activeView === 'query' ? 'bg-blue-600 text-white shadow-lg border-blue-400' : 'text-slate-300 hover:bg-slate-800 border-transparent hover:border-slate-600'}`}
                            >
                                <Database size={18} />
                                <span className="font-medium">数据查询</span>
                            </button>
                            <button
                                onClick={() => { setActiveView('stats'); setIsCreating(false); setEditingActivity(null); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ml-2 border-l-2 ${activeView === 'stats' ? 'bg-blue-600 text-white shadow-lg border-blue-400' : 'text-slate-300 hover:bg-slate-800 border-transparent hover:border-slate-600'}`}
                            >
                                <BarChart3 size={18} />
                                <span className="font-medium">数据统计</span>
                            </button>
                        </div>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                            <User size={16} className="text-slate-400" />
                        </div>
                        <div>
                            <div className="text-sm font-medium">Admin</div>
                            <div className="text-xs text-slate-500">超级管理员</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden flex flex-col">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
                    <div className="flex items-center text-sm text-gray-500">
                        <LayoutDashboard size={16} className="mr-2" />
                        <span>首页</span>
                        <ChevronRight size={14} className="mx-2" />
                        <span className="text-gray-800 font-medium">
                            {activeView === 'general' && '通用配置'}
                            {activeView === 'activity' && '轮盘配置'}
                            {activeView === 'query' && '数据查询'}
                            {activeView === 'stats' && '数据统计'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-6xl mx-auto">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
}

// Mount the React application
ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
);