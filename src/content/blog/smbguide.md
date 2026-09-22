---
title: 'Simple Use of Samba'
author: 'Juliet'
description: 'How to use samba for file sharing'
pubDate: 'Oct 20 2025'
tags: ["linux", "tool"]
pinned: false
license: "CC BY-SA 4.0"
---
By ***Juliet***

# **Introduction of SMB&Samba**

[SMB(Server Message Block)](https://https://en.wikipedia.org/wiki/Server_Message_Block) is the standard Windows interoperability suite of programs for Linux and Unix. Since 1992, Samba has provided secure, stable and fast file and print services for all clients using the SMB/CIFS protocol, such as all versions of DOS and Windows, OS/2, Linux and many others.

[Samba](https://en.wikipedia.org/wiki/Samba) is a free software re-implementation of the SMB networking protocol, and was originally developed by Andrew Tridgell. Samba provides file and print services for various Microsoft Windows clients[4] and can integrate with a Microsoft Windows Server domain, either as a Domain Controller (DC) or as a domain member. As of version 4, it supports Active Directory and Microsoft Windows NT domains.

# **Installation**

If you are using pacman as your package manager, run commands below to install
```bash
sudo pacman -S samba
```

# **Configuration**

You can also check [Samba](https://wiki.archlinux.org/title/Samba) in Archwiki for reference
Usually, the configure file of samba is ```/etc/samba/smb.conf```
But the samba package does not provide this file, you need to create it before starting ```smb.service```
A documented example as in ```smb.conf.default``` from the [Samba git repository](https://git.samba.org/samba.git/?p=samba.git;a=blob_plain;f=examples/smb.conf.default;hb=HEAD) may be used to setup ```/etc/samba/smb.conf```
```bash
wget "https://git.samba.org/?p=samba.git;a=blob_plain;f=examples/smb.conf.default;hb=HEAD" -O smb.conf
```












**Don't forget** to run ```testparm``` to check for syntactic errors

# **Enabling and Staring Services**

```bash
sudo systemctl enable smb.service
sudo systemctl start smb.service
```

If you want to make your service accessible via NetBIOS host name, set the desired name in the ```netbios name``` option in ```smb.conf``` and enable/start ```nmb.service```

# **Basic Settings**

## User Management
Only users those who have Linux account are able to access the samba server, you can create a special account or use current accounts

Although the user name is shared with Linux system, samba uses a password seperate from that of the Linux user accounts
Use the following command to set the password of a user
```bash
smbpasswd -a <smb_user_name>
```
Use the following command to change the password of a user
```bash
smbpasswd <smb_user_name>
```
Use the following command to list all the samba users
```bash
sudo pdbedit -L -v
```

## Create an Anonymous Share 
First create a Linux user which anonymous samba user will be mapped to
```bash
sudo useradd smb_guest -s /bin/nologin
```
**Note** that the username can be any vaild Linux username, and it does not need to be a samba user
Then add the following to ```/etc/samba/smb.conf```
```text
...
[global]
security = user
map to guest = bad user
guest account = smb_guest

[guest_share]
    comment = guest share
    path = /<your target path>
    public = yes
    only guest = yes
    writable = yes
    printable = yes
```
Anonymous users will now be mapped to the Linux user guest and have the ability to access any directories defined in ```guest_share.path```, which is configured to be ```/<your target path>``` in the example above.
And make sure that the Linux user ```smb_guest``` has the proper permissions to access files in ```guest_share.path```

# More Details Will Be Updated
