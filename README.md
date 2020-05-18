# Authentication-P2

Authentication using a USB device as an easy to use 2FA for a password vault

## How to start the dev environment

1. Insert USB in the machine and make sure that it is mounted on E:\
    - https://docs.microsoft.com/en-us/windows-server/storage/disk-management/change-a-drive-letter
2.  Run vs code as admin.
    - Or open powershell as admin and run `set-executionpolicy remotesigned`.
3. Execute `.\run.ps1` in vs code. This will start the server and admin tools
4. Create a user and press "Write to USB" and then press the user in the new list of users.
5. Close the admin tools, this will then open the Key Authenticator.
6. Open a browser and go to the URL localhost:3000.

## How to build electron

### USB Drive
- Run the command: `electron-packager ./ 'Key Authenticator' --icon=USB/usb --overwrite --ignore='\.git(ignore|modules|attributes)' --ignore='\.(sqlite|vscode|md|ini|ps1)' --ignore='(Server|Tests|node_modules|Website|kennethWebsite)' --ignore='(main|admin_tools)'`

### Admin Tools
- Run the command: `electron-packager ./ 'Admin Tools' --overwrite --ignore='\.git(ignore|modules|attributes)' --ignore='\.(sqlite|vscode|md|ini|ps1)' --ignore='(Server|Tests|node_modules|Website|kennethWebsite|Key Authenticator)' --ignore='(error|usb|style)'`