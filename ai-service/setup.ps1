$python = "C:\Users\Lokesh Yadav\AppData\Local\Programs\Python\Python311\python.exe"
Write-Host "Creating virtual environment using Python 3.11..."
& $python -m venv venv --clear
Write-Host "Installing packages from requirements.txt..."
& ".\venv\Scripts\pip.exe" install -r requirements.txt
Write-Host "Done!"
