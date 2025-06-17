; InfoBot Agent Installer
; NSIS Script for Windows Service Installation

!define APPNAME "InfoBot Agent"
!define COMPANYNAME "InfoBot"
!define DESCRIPTION "Local agent service for InfoBot PWA script execution"
!define VERSIONMAJOR 1
!define VERSIONMINOR 0
!define VERSIONBUILD 0

!define HELPURL "https://github.com/r-hagi/InfoBot"
!define UPDATEURL "https://github.com/r-hagi/InfoBot/releases"
!define ABOUTURL "https://github.com/r-hagi/InfoBot"

!define INSTALLSIZE 50000 ; Estimate in KB

RequestExecutionLevel admin
InstallDir "$PROGRAMFILES64\${APPNAME}"
LicenseData "license.txt"
Name "${APPNAME}"
Icon "icon.ico"
outFile "InfoBot-Setup.exe"

!include LogicLib.nsh
!include WinVer.nsh
!include x64.nsh

page license
page directory
page instfiles

!macro VerifyUserIsAdmin
UserInfo::GetAccountType
pop $0
${If} $0 != "admin"
    messageBox mb_iconstop "Administrator rights required!"
    setErrorLevel 740
    quit
${EndIf}
!macroend

function .onInit
    setShellVarContext all
    !insertmacro VerifyUserIsAdmin
    
    ; Check if already installed
    ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "UninstallString"
    ${If} $0 != ""
        MessageBox MB_YESNO|MB_ICONQUESTION "InfoBot Agent is already installed. Do you want to uninstall the previous version?" IDYES uninst
        Abort
        uninst:
            ExecWait '$0 /S _?=$INSTDIR'
            ${If} ${Errors}
                MessageBox MB_ICONSTOP "Failed to uninstall previous version"
                Abort
            ${EndIf}
    ${EndIf}
functionEnd

section "install"
    ; Files to install
    setOutPath $INSTDIR
    file "..\dist\agent.exe"
    file "..\scripts\example.ps1"
    
    ; Create data directory
    CreateDirectory "$PROGRAMDATA\InfoBot"
    CreateDirectory "$PROGRAMDATA\InfoBot\logs"
    
    ; Install as Windows Service
    nsExec::ExecToLog '"$INSTDIR\agent.exe" --install-service'
    Pop $0
    ${If} $0 != 0
        MessageBox MB_ICONSTOP "Failed to install Windows service (Error: $0)"
        Abort
    ${EndIf}
    
    ; Start the service
    nsExec::ExecToLog 'sc start "InfoBot Agent"'
    
    ; Registry entries
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayName" "${APPNAME}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "UninstallString" "$\"$INSTDIR\uninstall.exe$\""
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "QuietUninstallString" "$\"$INSTDIR\uninstall.exe$\" /S"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "InstallLocation" "$\"$INSTDIR$\""
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayIcon" "$\"$INSTDIR\agent.exe$\""
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "Publisher" "${COMPANYNAME}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "HelpLink" "${HELPURL}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "URLUpdateInfo" "${UPDATEURL}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "URLInfoAbout" "${ABOUTURL}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayVersion" "${VERSIONMAJOR}.${VERSIONMINOR}.${VERSIONBUILD}"
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "VersionMajor" ${VERSIONMAJOR}
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "VersionMinor" ${VERSIONMINOR}
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "NoModify" 1
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "NoRepair" 1
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "EstimatedSize" ${INSTALLSIZE}
    
    ; Create uninstaller
    writeUninstaller "$INSTDIR\uninstall.exe"
    
    MessageBox MB_OK "InfoBot Agent has been successfully installed and started.$\n$\nThe agent is now running on 127.0.0.1:3210"
sectionEnd

section "uninstall"
    ; Stop and remove service
    nsExec::ExecToLog 'sc stop "InfoBot Agent"'
    Sleep 3000
    nsExec::ExecToLog '"$INSTDIR\agent.exe" --uninstall-service'
    
    ; Remove files
    delete "$INSTDIR\agent.exe"
    delete "$INSTDIR\example.ps1"
    delete "$INSTDIR\uninstall.exe"
    rmDir "$INSTDIR"
    
    ; Remove data directory (optional - ask user)
    MessageBox MB_YESNO "Do you want to remove all data files (logs, configuration)?" IDNO skip_data
        rmDir /r "$PROGRAMDATA\InfoBot"
    skip_data:
    
    ; Remove registry entries
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}"
sectionEnd 