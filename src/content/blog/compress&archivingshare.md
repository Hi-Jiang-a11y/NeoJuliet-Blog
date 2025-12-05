---
title: 'Compressing and Archiving'
author: 'Juliet'
description: 'A Simple Guidance For Compressing and Archiving'
pubDate: 'Oct 26 2025'
tags: ["linux", "tutorial", "tool"]
pinned: false
license: "CC BY-SA 4.0"
---
By ***Juliet***
## **Compressing Files**
### **gzip**
The gzip is used to compress one or more files, when executed, it replaces the original files with a compressed version of the original
```bash
Juliet@ArchJ ~$ ls -l /etc > test.txt
Juliet@ArchJ ~$ gzip test.txt
Juliet@ArchJ ~$ ls -l test.*
-rw-r—-r—- Juliet Juliet 3230 2025-10-23 08:27 test.txt.gz

```
And the corresponding command ```gunzip``` is used to restore the compressed file to it’s original
```bash
Juliet@ArchJ ~$ gunzip test.txt
Juliet@ArchJ ~$ ls -l test.*
-rw-r—-r—- Juliet Juliet 15738 2025-10-23 08:27 test.txt
```
The gzip has many options, here list some commonly used
| **Options** | **Long option** | **description** |
|:---:|:---:|:---|
|-d|--decompression|Decompress, act like gunzip|
|-l|--list|List compression statistics for each file compressed|
|-v|--verbose|Display verbose message while compressing|
|-t|--test|Check the integrity of a compress file|
|-r|--recursive|If there are directories in the arguments, recursively compress files contained within them|
|-k|--keep|Keep the original files|

Run ```gzip --help``` or ```man gzip```for more information  
Examples:
```bash
gzip -tv test.txt.gz  #check the integrity and display
gzip -d test.txt.gz  #same as gunzip, uncompress
```
If you want to compress all the file in a directory recursively:
```bash
Juliet@ArchJ ~$ tree ./example
example/
 ├── a.txt
 ├── b.log
 └── sub/
     └── c.csv
Juliet@ArchJ ~$ gzip -rv ./example
Juliet@ArchJ ~$ tree ./example
example/
 ├── a.txt.gz
 ├── b.log.gz
 └── sub/
     └── c.csv.gz
```


## **Archiving Files**
### **tar**
#### Basic Usage
The tar(*tape archive*) is a typical tool for archiving files  
The command syntax works like this:
```bash
tar mode[options] pathname
```
Here lists some commonly used modes:
|Mode|Description|
|:---:|:---|
|c|Create a archive from a list of files or directories|
|x|Extract an archive|
|r|Append specified pathnames to the end of an archive|
|t|List the contents of an archive|

**Note** that you can only choose one mode while using tar, and the mode must be specified before any other option.

Here lists some commonly used options:
|**Options**|**Long Options**|**Description**|
|:---:|:---:|:---|
|f|--file=example.tar|Specified the name of the archive file|
|v|--verbose|Display verbose message while archiving|
|p|--preserve-permissions|Reserve the original files' permission|
|z|--gzip|Archive and use gzip to compress|
|j|--bzip2|Archive and use bzip2 to compress|
```bash
tar cf example.tar example
```
This command create a archived file named ```example.tar```  
Notice that there is no need to add a leading dash
```bash
tar tvf example.tar
```
This command is used for listing the content of the archived file
```bash
tar xf example.tar
```
This command is used for extract the `example.tar` to present working directory
#### Pathname Process
The pathname process of tar is interesting, the default for pathname is relative, rather than absolute, so tar does this by simply removing the leading slash `/` from the pathname when creating the archive, let's take an example:
```bash
Juliet@ArchJ ~$ mkdir -p ~/example1/test
Juliet@ArchJ ~$ mkdir ~/example2
Juliet@ArchJ ~$ cd ~
Juliet@ArchJ ~$ tar cf example1.tar /home/Juliet/example1
Juliet@ArchJ ~$ tree
/home/Juliet/
└── example1
    └── test
├── example2
└── ...
Juliet@ArchJ ~$ cd ~/example2
Juliet@ArchJ ~$ tar xf /home/Juliet/example1.tar
Juliet@ArchJ ~$ tree
/home/Juliet/example2/
└── home
    └── Juliet
        └── example1
            └──test
```
This because in the archiving file `example1.tar` the path prefix(leading slash `/`) is removed, so after extracting in `~/example2`, tar will create `home/Juliet/...` again
#### Advanced Usage
When extracting an archive, it is possible to limit what is extracted from the archive, for example, if we want to extract one or more files from the archive:
```bash
tar xvf ./example.tar <pathname1> <pathname2> <pathname3>
```
The `<pathname>` must be full, you can use `tar tf ./example.tar` to check the pathname  
Also, `tar` support the `--wildcards` option
```bash
tar xvf ./example --wildcards 'example1/directory*'
```
tar can also make use of both standard input and output:
```bash
find ./example -name 'file-A' | tar czf example.tar.gz -T -
```
Here `-T` means read the list of files to be archived from standard input  
This is equivalent to
```bash
find ./example -name 'file-A' | tar cf - --files-from=- | gzip > example.tar.gz
```
Here `tar cf - ` means writing the archived result to the standardout instead of a file, `--files-from` means archive the files from standardin

#### **Use tar Savely**
Sometimes it is **dangerous** to use tar without any check, because some malicious archive files may overwrite or contaminate system files  
A better way to extract archive files is to list the archive contents first:
```bash
tar tvf example.tar
```
And if you don't trust the source, you can first create a empty diretory and extract in this directory
```bash
mkdir ~/safe_extract
cd ~/safe_extract
tar xvf /path/to/example.tar
```
Also you can use `--one-top-level` to limit the extract directory
```bash
tar xvf /path/to/example.tar --one-top-level
```
This will create a new directory named with the archive file to store the extracted files  
Another advice is that be **careful** to run tar in **root privilege**, unless you know what are you doing and what will happen!  
You can add `--keep-old-files` to avoid overwriting and `--skip-old-files` to skip the files that aleady exist
```bash
tar xvf /path/to/example.tar --keep-old-files
```

## **Other Useful Tools**
### **zip**
The `zip` program is both a compression tool and archiver  
In it's most basic usage, zip is invoked like this:
```bash
zip [options] zipfile file
```
For example, if we want to make a zip archive of the home derectory:
```bash
cd /home
zip -r Juliet.zip ./Juliet
```
Use `unzip` to extract a zip file
```bash
cd /example
unzip /path/to/example.zip
```
Before extracting, you can add `-l` (and `-v`) option to list the content of the zip file:
```bash
unzip -l /path/to/example.zip
```
### **7zip**

