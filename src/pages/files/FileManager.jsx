import React, {useState, useEffect} from 'react';
import Backendless from 'backendless';
import axios from 'axios';

const FileManager = () => {
    // State
    const [currentUser, setCurrentUser] = useState(null);
    const [currentPath, setCurrentPath] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [folderName, setFolderName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareUsername, setShareUsername] = useState('');
    const [fileToShare, setFileToShare] = useState(null);
    const filesLogger = Backendless.Logging.getLogger('com.mbaas.FilesLogger');

    // Effects
    useEffect(() => {
        fetchCurrentUser().then(r => r);
    }, []);

    useEffect(() => {
        if (currentPath) {
            fetchFiles(currentPath).then(r => r);
        }
    }, [currentPath]);

    // Functions
    const fetchCurrentUser = async () => {
        try {
            const user = await Backendless.UserService.getCurrentUser();
            setCurrentUser(user);
            setCurrentPath(`/users/${user.username}`);
        } catch (error) {
            handleFetchError('current user');
        }
    };

    const fetchFiles = async (path) => {
        setLoading(true);
        clearMessages();

        try {
            const files = await Backendless.Files.listing(path, '*', false);
            const processedItems = files.map(item => ({
                ...item,
                directory: !item.name.includes('.'),
            }));
            setItems(processedItems);
        } catch (error) {
            handleFetchError('files');
        } finally {
            setLoading(false);
        }
    };

    const handleFetchError = (entity) => {
        console.error(`Failed to fetch ${entity}`);
        setErrors(prev => ({...prev, general: `Failed to fetch ${entity}. Please try again.`}));
    };

    const clearMessages = () => {
        setErrors({});
        setSuccessMessage('');
    };

    const handleCreateDirectory = async (e) => {
        e.preventDefault();
        setLoading(true);
        clearMessages();

        if (!folderName) {
            setErrors(prev => ({...prev, folderName: 'Folder name is required.'}));
            setLoading(false);
            return;
        } else if (/[^a-zA-Z0-9_]/.test(folderName)) {
            setErrors(prev => ({
                ...prev,
                folderName: 'Folder name can only contain letters, numbers, and underscores.'
            }));
            setLoading(false);
            setFolderName('');
            return;
        }

        try {
            const path = `${currentPath}/${folderName}`;
            await Backendless.Files.createDirectory(path);
            setSuccessMessage('Folder created successfully.');
            setFolderName('');
            await fetchFiles(currentPath);
        } catch (error) {
            handleFetchError('folder');
            filesLogger.error(`Failed to create directory ${folderName}: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleItemClick = (item) => {
        clearMessages();
        if (item.directory) {
            setCurrentPath(`${currentPath}/${item.name}`);
        }
    };

    const handleBackClick = () => {
        clearMessages();
        setCurrentPath(prevPath => {
            const parts = prevPath.split('/');
            parts.pop();
            return parts.join('/');
        });
    };

    const handleDeleteItem = async (item) => {
        setLoading(true);
        clearMessages();
        try {
            const pathToDelete = `${currentPath}/${item.name}`;
            if (item.directory) {
                await Backendless.Files.removeDirectory(pathToDelete);
            } else {
                await Backendless.Files.remove(pathToDelete);
            }
            setSuccessMessage(`${item.name} deleted successfully.`);
            await fetchFiles(currentPath);
        } catch (error) {
            handleFetchError('item');
        } finally {
            setLoading(false);
        }
    };

    const handleFileInputChange = (e) => {
        clearMessages();
        setSelectedFile(e.target.files[0]);
    };

    const handleUploadFile = async () => {
        if (!selectedFile) {
            setErrors(prev => ({...prev, file: 'Please select a file to upload.'}));
            return;
        }

        setLoading(true);
        clearMessages();

        try {
            const path = currentPath || `/users/${currentUser.username}`;
            await Backendless.Files.upload(selectedFile, path);
            setSuccessMessage('File uploaded successfully.');
            setSelectedFile(null);
            document.getElementById('fileInput').value = '';
            await fetchFiles(currentPath);
        } catch (error) {
            handleFetchError('file');
            filesLogger.error(`Failed to upload file in File Manager: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadFile = async (file) => {
        if (!file.publicUrl) {
            setErrors(prev => ({...prev, general: 'File download link is not available.'}));
            return;
        }
        const link = currentPath.includes('shared_with_me') ? (await axios.get(file.publicUrl)).data : file.publicUrl;
        window.open(link, "_blank");
    };

    const handleOpenShareModal = (file) => {
        clearMessages();
        setFileToShare(file);
        setIsShareModalOpen(true);
    };

    const handleCloseShareModal = () => {
        setIsShareModalOpen(false);
        setShareUsername('');
        setFileToShare(null);
    };

    const handleShareFile = async () => {
        clearMessages();
        if (!shareUsername) {
            setErrors(prev => ({...prev, shareUsername: 'Username is required.'}));
            return;
        }

        try {
            const whereClause = `username = '${shareUsername}'`;
            const queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(whereClause);
            const userExists = await Backendless.Data.of('Users').find(queryBuilder);

            if (userExists.length === 0) {
                setErrors(prev => ({...prev, shareUsername: 'User with this username not found.'}));
                return;
            }

            const sharedPath = `/users/${shareUsername}/shared_with_me`;
            const downloadLink = fileToShare.publicUrl;
            const fileContent = `${downloadLink}`;
            await Backendless.Files.saveFile(sharedPath, `${fileToShare.name}.txt`, fileContent, true);
            setSuccessMessage('File shared successfully.');
            handleCloseShareModal();
        } catch (error) {
            handleFetchError('sharing file');
        }
    };

    // Render
    return (
        <section className="vh-100" style={{backgroundColor: '#eee'}}>
            <div className="container h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-lg-10 col-xl-9">
                        <div className="card text-black" style={{borderRadius: '25px'}}>
                            <div className="card-body p-md-5">
                                <div className="row justify-content-center">
                                    <div className="col-md-10 col-lg-8 col-xl-9">
                                        <p className="text-center h1 fw-bold mb-4 mx-1 mx-md-4 mt-4">File Management</p>
                                        {currentUser ? (
                                            <>
                                                <div className="file-list">
                                                    {loading ? (
                                                        <p className="text-center">Loading...</p>
                                                    ) : (
                                                        <>
                                                            <h5 className="text-center">
                                                                {currentPath.substring(6)}
                                                            </h5>
                                                            {currentPath !== `/users/${currentUser?.username}` && (
                                                                <button
                                                                    className="mx-1 mx-md-2 mt-2 mb-2"
                                                                    onClick={handleBackClick}
                                                                    style={{
                                                                        cursor: 'pointer',
                                                                        border: 'none',
                                                                        background: 'none',
                                                                        textAlign: 'left',
                                                                    }}
                                                                >
                                                                    <i className="fas fa-arrow-left me-2"></i> Back
                                                                </button>
                                                            )}
                                                            <ul className="list-group list-group-flush">
                                                                {items.length === 0 ? (
                                                                    <li className="list-group-item text-center">
                                                                        No files or folders found.
                                                                    </li>
                                                                ) : (
                                                                    items.map((item) => (
                                                                        <li key={item.name} className="list-group-item"
                                                                            style={{
                                                                                display: 'flex',
                                                                                alignItems: 'center'
                                                                            }}>
                                                                            <button
                                                                                onClick={() => handleItemClick(item)}
                                                                                style={{
                                                                                    cursor: item.directory ? 'pointer' : 'default',
                                                                                    flex: 1,
                                                                                    border: 'none',
                                                                                    background: 'none',
                                                                                    padding: 0,
                                                                                    fontSize: 'inherit',
                                                                                    textAlign: 'left',
                                                                                    color: 'inherit',
                                                                                    textDecoration: 'none',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center'
                                                                                }}
                                                                            >
                                                                                {item.directory ? (
                                                                                    <i className="fas fa-folder me-2"></i>
                                                                                ) : (
                                                                                    <i className="fas fa-file me-2"></i>
                                                                                )}
                                                                                {item.name}
                                                                            </button>
                                                                            {item.directory ? null : (
                                                                                <>
                                                                                    <button
                                                                                        className="btn btn-sm btn-outline-primary mx-1"
                                                                                        onClick={() => handleDownloadFile(item)}>
                                                                                        <i className="fa-solid fa-download"></i>
                                                                                    </button>
                                                                                    {!currentPath.includes('shared_with_me') && (
                                                                                        <button
                                                                                            className="btn btn-sm btn-outline-success mx-1"
                                                                                            onClick={() => handleOpenShareModal(item)}>
                                                                                            <i className="fa-solid fa-share"></i>
                                                                                        </button>
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                            {!item.name.includes('shared_with_me') &&
                                                                                <button
                                                                                    className="btn btn-sm btn-outline-danger mx-1"
                                                                                    onClick={() => handleDeleteItem(item)}>
                                                                                    <i className="fa-regular fa-trash-can"></i>
                                                                                </button>
                                                                            }
                                                                        </li>
                                                                    ))
                                                                )}
                                                            </ul>

                                                        </>
                                                    )}
                                                </div>

                                                <div
                                                    className={successMessage ? 'text-success text-center mb-3' : 'd-none'}>
                                                    {successMessage}
                                                </div>

                                                <form className="mx-1 mx-md-2 needs-validation mt-4 mb-4"
                                                      onSubmit={handleCreateDirectory} noValidate>
                                                    <div className="d-flex flex-row align-items-center mb-2">
                                                        <i className="fa fa-folder-plus fa-lg me-2 fa-fw"></i>
                                                        <div className="form-outline flex-fill mb-0">
                                                            <input
                                                                type="text"
                                                                id="folderName"
                                                                className={`form-control form-control-sm ${errors.folderName ? 'is-invalid' : ''}`}
                                                                placeholder="Folder Name"
                                                                value={folderName}
                                                                onChange={(e) => setFolderName(e.target.value)}
                                                                required
                                                            />
                                                            <div className="invalid-feedback">{errors.folderName}</div>
                                                        </div>
                                                    </div>


                                                    <div className="d-flex justify-content-center mx-4 ">
                                                        <button type="submit" className="btn btn-primary btn-sm">
                                                            {'Create Folder'}
                                                        </button>
                                                    </div>
                                                </form>

                                                <div className="mx-1 mx-md-2 mt-4 mb-4">
                                                    <div className="form-outline flex-fill mb-0">
                                                        <input type="file"
                                                               id="fileInput"
                                                               onChange={handleFileInputChange}
                                                               className={`form-control form-control-sm ${errors.file ? 'is-invalid' : ''}`}
                                                        />
                                                        <div className="invalid-feedback">{errors.file}</div>
                                                    </div>
                                                    <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                                                        <button type="submit" className="btn btn-primary btn-sm mt-2"
                                                                onClick={handleUploadFile}>
                                                            Upload File
                                                        </button>
                                                    </div>
                                                </div>

                                                {isShareModalOpen && (
                                                    <div className="modal show" tabIndex="-1"
                                                         style={{display: 'block'}}>
                                                        <div className="modal-dialog modal-dialog-centered">
                                                            <div className="modal-content">
                                                                <div className="modal-header">
                                                                    <h5 className="modal-title">Share File</h5>
                                                                    <button type="button" className="btn-close"
                                                                            onClick={handleCloseShareModal}></button>
                                                                </div>
                                                                <div className="modal-body">
                                                                    <div className="form-outline mb-2">
                                                                        <label className="form-label"
                                                                               htmlFor="shareUsername">Enter username to
                                                                            share
                                                                            with</label>
                                                                        <input
                                                                            type="text" id="shareUsername"
                                                                            className="form-control"
                                                                            value={shareUsername}
                                                                            onChange={(e) => setShareUsername(e.target.value)}/>

                                                                    </div>
                                                                    {errors.shareUsername && (
                                                                        <div className="text-danger">
                                                                            {errors.shareUsername}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="modal-footer">
                                                                    <button type="button" className="btn btn-secondary"
                                                                            onClick={handleCloseShareModal}>Close
                                                                    </button>
                                                                    <button type="button" className="btn btn-primary"
                                                                            onClick={handleShareFile}>Share File
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>) : (
                                            <p className="text-center">Loading user information...</p>
                                        )}
                                        <div
                                            className={errors.general ? 'text-danger text-center mb-3' : 'd-none'}>
                                            {errors.general}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FileManager;
