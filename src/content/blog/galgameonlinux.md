---
title: 'Linux上优雅地运行Galgame心得(Updating)'
author: 'Juliet'
description: 'Play galgames on Linux ELEGANTLY'
pubDate: 'Dec 1 2025'
updatedDate: 'Dec 3 2025'
tags: ["galgame", "linux", "tool", "share"]
pinned: false
license: "CC BY-SA 4.0"
---
> *wine 指北*  
Galgame 是精神食粮，Linux 是生活方式。你会发现`Girls & Love`确实可以跨平台。但在享受`Girls & Love`的前一秒，你可能会先经历 Wine 崩、窗口黑屏、字体爆炸、乱码满天飞...  

# Wine 不是模拟器
`Wine` 是 `Wine Is Not an Emulator` 的递归缩写，字面意思，它不是**模拟器**，它只是一个让 Windows 程序以为正运行在 Windows 里的兼容层。  

`wine` 始于 1993 年，当时 Linux 才刚脱离襁褓。那一代工程师把 Wine 当成“让 Linux 用户不用装双系统”的武器。
后来 Wine 越做越大，出现了众多变种：*CrossOver*、*Proton* 等。如今玩 Galgame 时，有 Wine，~~基本就够你无痛开局~~。

`wine` 做的事情非常简单粗暴：  
> + 翻译 Windows API → POSIX/Linux API
> + 拦截并实现 DirectX、GDI 等调用
> + 创造一个“伪 Windows 文件系统”给软件栖身

传统的虚拟机的做法是：
> 整个 Windows 系统运行在虚拟硬件里 → 软件调用 Windows 内核 → 内核再调宿主 OS

`wine` 采用完全不同的路线：
> 应用程序调用 Windows API → Wine 在用户态实现这些 API → 映射到 Linux/POSIX 系统调用

所以 `wine` 不需要模拟CPU，模拟BIOS/UEFI，启动Windows Kernal，加载Windows Driver  
这使 `wine` 的性能***能够***接近原生，尤其在CPU密集程序上  

# 安装必要工具
下文基于 `ArchLinux + wayland` 环境，可参照(Wine)[https://wiki.archlinuxcn.org/wiki/Wine]  
## 本体
+ 官方仓库 `wine` 开发版， AUR `wine-stable` 稳定版
+ 官方仓库 `winetricks` 包或者AUR `winetricks-git` 包 —— かみ一般的存在——可以很方便的安装一些 Windows 程序所需依赖的脚本，库，组件，字体。包括 Direct9、MSXML、Visual 运行时库和很多其它组件
## 第三方程序
+ AUR `bottles`（个人没用明白，但是 wiki 上写了，无脑抄下来😋）
+ AUR `winegui`（用户友好的 wine 图形界面）
+ `steam`(かみ！proton 无敌)

# 食用方法
## 初始化 & 程序启动
配置wine通常使用如下方法：  
+ `wine condtrol`：wine 对 Windows 控制面板的实现
+ `regedit`：wine 的注册表编辑工具
+ `winecfg`：wine 的 GUI 配置工具
+ ...

装完 wine，首先就是 `winecfg`，配置环境  
大部分游戏选择 win7/win10 就可以了（老游戏可能只认 Win7，新游戏更喜欢 Win10（~~有些Gal比它女主还傲娇~~））  
可以选择 `driver_c` 里面创建的软链接等等  
可以试一下在Graphical里面开启虚拟桌面，有可能解决全屏模式下窗口消失/黑屏/键盘无法输入等恶心问题  

默认情况下，`wine` 将其配置文件和安装的 Windows 程序存储在 `~/.wine`，通常会把此目录叫做 `Wine prefix`。当运行 Windows 程序或 Wine 的捆绑程序如 winecfg 时，它会自动创建/更新。前缀目录还包含一个目录 `driver_c`，Windows 程序将其视为 `C:\\`  
可以使用环境变量 `WINEPREFIX` 指定要对不同的prefix做的事情，比如：
```
env WINEPREFIX=~/.wine_prefix_A wine Program_A.exe
env WINEPREFIX=~/.wine_prefix_B wine Program_B.exe
```
`Program_A.exe` 和 `Program_B.exe` 会分别在 `~/.wine_prefix_A` 和 `~/.wine_prefix_B` 有各自单独的C盘目录和注册表配置  

所有正在运行中的 `wine` `wineconsole` 可以使用 `wineserver -k` 终止，此命令能和 `WINEPREFIX` 搭配食用（本人更加习惯 `ps+grep+kill`组合技😋）
## 字体 & 运行库/组件安装
### 字体
根据wiki的讲法，可以尝试用软链接的方式，将系统字体文件映射到对应 `WINEPREFIX` 中
```
cd ${WINEPREFIX:-~/.wine}/drive_c/windows/Fonts && for i in /usr/share/fonts/**/*.{ttf,otf}; do ln -s "$i" ; done
```
还可以使用修改注册表的方法，讲一下文本保存为 chs.reg：
```
REGEDIT4

[HKEY_LOCAL_MACHINE\Software\Microsoft\Windows NT\CurrentVersion\FontSubstitutes]
"MS Shell Dlg"="Noto Sans CJK SC"
"MS Shell Dlg 2"="Noto Sans CJK SC"
"SimSun"="Noto Sans CJK SC"
"Microsoft YaHei"="Noto Sans CJK SC"
```
执行 `wine regedit ./chs.reg` 导入，关闭所有wine服务运行 `winecfg`  

还可以使用 winetricks，直接运行 `winetricks` 鼠标点点就好了  
使用 `winetricks fontsmooth=rgb` 还可以启用字体平滑  

### 运行库/组件
有的 Gal 默认调用 DirecX，wine 渲染炸了，可以试一下装 `d3dx9` 和 `d3dcompiler_43`  
也有可能是显卡驱动问题，确保装了 `nvidia-utils`  
程序启动失败看终端输出，在winetrick里面找就好了  

# 使用 Proton 😋
很多 Gal 可以直接使用 Steam 的 Proton 运行，`proton` 基于 wine 深度改造，本人用起来相当不错，非常稳定，不用折腾（Steam 无脑兼容方案）  
添加非 steam 游戏
在 `Manage` → `Properties` → `Compatibility` → 勾选 `Force the use of a specific Steam Play compatibility tool` → 选择一个合适的 Proton 版本

# 疑难杂症
## 无法启动
日志贴出来把缺的库装上，实在不行贴给 AI
## 画面问题/黑屏
`d3dx9`, `d3dcompiler_43`，`direx...`，`dxvk`试一遍  
`winecfg` 开虚拟桌面  
（实测 proton 玩 gal 的时候全屏有点问题，鼠标碰到屏幕上边缘会触发窗口模式）  
（实测 proton 下 动画 op 和 ed 无法播放或者卡顿严重，wine 下游戏启动动画可能会消失）
## 声音
貌似 proton 和 wine 都有声音抽风的问题，新老游戏都有

# 实在不行
## 虚拟机启动((😋
 
