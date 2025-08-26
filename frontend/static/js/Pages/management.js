
// Preview รูปก่อนบันทึก
document.getElementById("editImages").addEventListener("change", function (event) {
    const preview = document.getElementById("editPreview");
    preview.innerHTML = ""; // ล้างรูปเก่า
    Array.from(event.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.className = "w-20 h-20 object-cover rounded border border-gray-600";
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
});

