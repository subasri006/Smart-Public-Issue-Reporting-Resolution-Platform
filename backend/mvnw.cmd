@echo off
setlocal

set "WRAPPER_MAVEN=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.14\ed7edd442f634ac1c1ef5ba2b61b6d690b5221091f1a8e1123f5fadcc967520d\bin\mvn.cmd"

if exist "%WRAPPER_MAVEN%" (
    call "%WRAPPER_MAVEN%" %*
    exit /b %ERRORLEVEL%
)

if exist "C:\Users\ASUS\.m2\wrapper\dists\apache-maven-3.9.14\ed7edd442f634ac1c1ef5ba2b61b6d690b5221091f1a8e1123f5fadcc967520d\bin\mvn.cmd" (
    call "C:\Users\ASUS\.m2\wrapper\dists\apache-maven-3.9.14\ed7edd442f634ac1c1ef5ba2b61b6d690b5221091f1a8e1123f5fadcc967520d\bin\mvn.cmd" %*
    exit /b %ERRORLEVEL%
)

where mvn >nul 2>nul
if %ERRORLEVEL% equ 0 (
    call mvn %*
    exit /b %ERRORLEVEL%
)

echo [ERROR] Maven not found. Please ensure Maven is installed or in PATH.
exit /b 1
